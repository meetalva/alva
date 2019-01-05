#!/usr/bin/env node
import * as Fs from 'fs';
import { performAnalysis } from '../matchers/perform-analysis';
import * as Path from 'path';
import * as Model from '../model';
import * as Types from '../types';
import * as Util from 'util';

const yargsParser = require('yargs-parser');
const readFile = Util.promisify(Fs.readFile);
const writeFile = Util.promisify(Fs.writeFile);

async function main() {
	const flags = yargsParser(process.argv.slice(2));
	const [rawPath] = flags._;

	const path = Path.resolve(flags.cwd || process.cwd(), rawPath);

	const outPath = flags.out ? Path.resolve(flags.cwd || process.cwd(), flags.out) : undefined;

	const previousPath = flags.previous
		? Path.resolve(flags.cwd || process.cwd(), flags.previous)
		: undefined;

	const previousLibrary = previousPath
		? Model.PatternLibrary.from(JSON.parse(String(await readFile(previousPath))))
		: undefined;
	const analysis = await performAnalysis(path, { previousLibrary });

	if (analysis.type === Types.LibraryAnalysisResultType.Error) {
		console.trace(analysis.error);
		process.exit(1);
		return;
	}

	const project = Model.Project.create({ name: 'Project', draft: true, path: 'project' });
	const library = Model.PatternLibrary.fromAnalysis(
		analysis.result,
		{ project },
		{ analyzeBuiltins: true }
	);

	if (typeof outPath !== 'undefined') {
		await writeFile(outPath, JSON.stringify(library.toJSON()));
	}
}

main().catch(err => {
	throw err;
});
