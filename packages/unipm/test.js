const { install } = require('./lib/install');
const nodeFetch = require('node-fetch');
const tempy = require('tempy');
const fs = require('fs');

async function main() {
	const cwd = tempy.directory();
	console.log(cwd);
	await install('material-ui', { fetch: nodeFetch, cwd, fs });
}

main();
