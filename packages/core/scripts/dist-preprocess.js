const { execSync } = require('child_process');

execSync('standard-version --no-verify');
console.info('Clean build environment.');
execSync('npm run build:clean');

console.info('Starting Alva application build.');
execSync('npm run build:electron');
