const { execSync } = require('child_process');

execSync('standard-version --no-verify');
console.info('Clean build enviroment.');
execSync('npm run build:clean');

console.info('Starting to copy designkit to build folder.');
execSync(`
	git clone git@github.com:meetalva/designkit.git --depth=1 build/designkit &&
	rm -r build/designkit/.[^.]*
`)

console.info('Install node packages for designkit.');
execSync(`
	npm i &&
	npm run build &&
	rm -rf node_modules &&
	npm i --production
`, {
		cwd: 'build/designkit'
	}
);

console.info('Distrubution preperation finished.');
console.info('Starting Alva application build.');
execSync('npm run build:electron');
