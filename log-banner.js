// Modern, colorful log banner for npm run dev
const chalk = require('chalk');
console.log('\n' +
  chalk.bgCyan.bold('   🚀 SaaS POS Dashboard   ') + '\n' +
  chalk.cyanBright('╭──────────────────────────────────────────────╮') + '\n' +
  chalk.cyanBright('│ ') + chalk.whiteBright('Aplikasi Point of Sale Modern & Aman') + chalk.cyanBright(' │') + '\n' +
  chalk.cyanBright('│ ') + chalk.white('URL: ') + chalk.greenBright('http://localhost:3000') + ' '.repeat(13) + chalk.cyanBright('│') + '\n' +
  chalk.cyanBright('╰──────────────────────────────────────────────╯') + '\n'
);
