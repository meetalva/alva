#!/usr/bin/env node
import * as Fs from 'fs';
import { performAnalysis } from '@meetalva/analyzer';
import * as Path from 'path';
import * as Model from '@meetalva/model';
import * as Types from '@meetalva/types';
import * as Util from 'util';
import * as JSON5 from 'json5';

const yargsParser = require('yargs-parser');
const readFile = Util.promisify(Fs.readFile);
const writeFile = Util.promisify(Fs.writeFile);

async function main() {
	const flags = yargsParser(process.argv.slice(2));

	const missing = ['in', 'out'].filter(
		flag => !flags.hasOwnProperty(flag) || typeof flags[flag] !== 'string'
	);

	if (missing.length > 0) {
		console.error(`missing required flags: ${missing.map(m => `--${m}`).join(', ')}`);
		process.exit(1);
	}

	const cwd = flags.cwd || process.cwd();
	const path = Path.resolve(cwd, flags.in);
	const outPath = flags.out ? Path.resolve(cwd, flags.out) : '';

	const previousLibrary = Fs.existsSync(outPath)
		? Model.PatternLibrary.from(
				JSON5.parse(
					String(await readFile(outPath))
						.replace(/^export const analysis = /, '')
						.replace(/\;\n$/, '\n')
				)
		  )
		: undefined;

	const ids = previousLibrary ? previousLibrary.getIdMap() : undefined;

	const analysis = await performAnalysis(path, { ids });

	if (analysis.type === Types.LibraryAnalysisResultType.Error) {
		console.trace(analysis.error);
		process.exit(1);
		return;
	}

	const project = Model.Project.create({ name: 'Project', draft: true, path: 'project' });
	const library = Model.PatternLibrary.fromAnalysis(analysis.result, {
		project,
		analyzeBuiltins: true,
		installType: Types.PatternLibraryInstallType.Local
	});

	await writeFile(
		outPath,
		`export const analysis = ${JSON.stringify(library.toJSON(), null, '  ')}`
	);
}

main().catch(err => {
	throw err;
});
