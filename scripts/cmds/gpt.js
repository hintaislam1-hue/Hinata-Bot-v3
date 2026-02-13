const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "gpt",
                aliases: ["gpt4"],
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        bn: "জিপিটি-৪ এআই এর মাধ্যমে প্রশ্নের উত্তর পান",
                        en: "Get answers from GPT-4 AI"
                },
                category: "ai",
                guide: {
                        bn: '   {pn} <প্রশ্ন>: যেকোনো কিছু জিজ্ঞাসা করুন\n   রিপ্লাই দিয়ে কথোপকথন চালিয়ে যেতে পারেন',
                        en: '   {pn} <question>: Ask anything to AI\n   Reply to continue the chat'
                }
        },

        langs: {
                bn: {
                        noPrompt: "⚠️ বেবি, কিছু তো জিজ্ঞাসা করো! উদাহরণ: {pn} তুমি কে?",
                        noResponse: "× এআই থেকে কোনো উত্তর পাওয়া যায়নি।",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noPrompt: "⚠️ Baby, please provide a question! Example: {pn} Who are you?",
                        noResponse: "× No response received from AI.",
                        error: "× API error: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const query = args.join(" ");
                if (!query) return message.reply(getLang("noPrompt"));

                return await handleGPT(api, event, query, this.config.name, getLang);
        },

        onReply: async function ({ api, event, Reply, args, getLang }) {
                if (Reply.author !== event.senderID) return;

                const prompt = args.join(" ");
                if (!prompt) return;

                return await handleGPT(api, event, prompt, this.config.name, getLang);
        }
};

async function handleGPT(api, event, prompt, commandName, getLang) {
        try {
                const baseUrl = await baseApiUrl();
                const apiUrl = `${baseUrl}/api/gpt`;

                const response = await axios.post(apiUrl, {
                        question: prompt,
                        contents: [{ parts: [{ text: prompt }] }]
                }, {
                        headers: { "Content-Type": "application/json" }
                });

                const replyText = response.data.response || getLang("noResponse");

                api.sendMessage(replyText, event.threadID, (error, info) => {
                        if (!error) {
                                global.GoatBot.onReply.set(info.messageID, {
                                        commandName: commandName,
                                        author: event.senderID,
                                        messageID: info.messageID,
                                        type: "reply"
                                });
                        }
                }, event.messageID);

        } catch (err) {
                console.error("GPT Error:", err);
                api.sendMessage(getLang("error", err.message), event.threadID, event.messageID);
        }
}
