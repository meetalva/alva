#!/usr/bin/env node
import * as Path from 'path';
import * as readPkg from 'read-pkg';
import * as _ from 'lodash';
import execa = require('execa');
import dargs = require('dargs');

const yargs = require('yargs-parser');

async function main(flags: { [key: string]: unknown }): Promise<void> {
	const { cwd: rawCwd, _: rawInput, ...other } = flags;
	const cwd = Path.resolve(process.cwd(), typeof rawCwd === 'string' ? rawCwd : '.');
	const pkg = await readPkg(cwd);

	const deps = Object.keys(pkg.dependencies || {});
	const [allTypes, implementations] = _.partition(deps, name => name.startsWith('@types'));
	const types = allTypes.filter(type => implementations.includes(type.split('/')[1]));
	const autoIgnores = _.flatMap(types, t => ['-i', t]).concat([
		'-i',
		'@types/node',
		'-i',
		'tslib'
	]);

	const input = (Array.isArray(rawInput) ? rawInput : []).filter(
		(item): item is string => typeof item === 'string'
	);
	const base = input[0] || '.';

	const userFlags = _.flatMap(Object.entries(other), ([key, value]) => dargs({ [key]: value }));

	try {
		await Promise.all([
			execa('dependency-check', [base, '-e', 'js:precinct', '--no-dev', ...userFlags]),
			execa('dependency-check', [
				base,
				'-e',
				'js:precinct',
				'--extra',
				'--no-dev',
				...autoIgnores,
				...userFlags
			])
		]);
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
}

main(yargs(process.argv.slice(2))).catch(err => {
	throw err;
});
