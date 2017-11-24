const {exec} = require('child_process');
const path = require('path');
const chokidar = require('chokidar');
const log = require('winston')

module.exports = () => {
  const pattern = path.join(__dirname, '../src/**/*.jsx')
  chokidar.watch(pattern).on('all', (e, p) => {
    const command = path.join(__dirname, '../node_modules/.bin/babel src -d dist')
    exec(command, (err, info) => {
      if (err) {
        throw err
      }
      log.info(`running babel:\n${info}`)
    })
  });
};
