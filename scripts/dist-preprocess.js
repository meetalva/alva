const { execSync } = require('child_process');

execSync('standard-version --no-verify');
console.info('Clean build enviroment.');
execSync('npm run clean-build');

console.info('Starting to copy designkit to build folder.');
execSync(`
	mkdir build/designkit &&
	cp -r ../designkit/patterns ../designkit/alva ../designkit/*.* build/designkit/
`);

console.info('Install node packages for designkit.');
execSync(`
	npm i &&
	npm run build &&
	rm -rf node_modules &&
	npm i --production &&
	npm i @types/react
`, {
		cwd: 'build/designkit'
	}
);

console.info('Distrubution preperation finished.');
console.info('Starting Alva application build.');
execSync('npm run electron-build');
