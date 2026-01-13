const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
  config: {
    name: 'shell',
    version: '1.7',
    author: 'MahMUD',
    role: 0,
    category: 'admin',
    guide: {
      en: '{pn} [command]',
    },
  },
  onStart: async function ({ api, args, message, event }) {    
    if (args.length === 0) {
      message.reply('Usage: {pn} [command]');
      return;
    }

    const command = args.join(' ');

    try {
      const { stdout, stderr } = await exec(command);

      if (stderr) {
        message.send(`${stderr}`);
      } else {
        message.send(`${stdout}`);
      }
    } catch (error) {
      console.error(error);
      message.reply(`Error: ${error.message}`);
    }
  },
};
