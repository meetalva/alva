const {exec} = require('child_process');
const watch = require('./watch-files');

watch();
exec('npm run start');

