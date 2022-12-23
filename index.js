#!/usr/bin/env node

const { program } = require('commander');

const begin = require('./src/begin');

program
  .version('1.0.7', '-v, --version')

program
  .command('t <configPath>')
  .description('automatic translating by crowdin and your specific config file')
  .action((configPath) => {
    begin(configPath);
  });

program.parse(process.argv);