import * as Fs from 'fs';
import * as Path from 'path';
import * as Util from 'util';
import * as Model from '@meetalva/model';
import * as Analyzer from '@meetalva/analyzer';
import * as Types from '@meetalva/types';

const yargsParser = require('yargs-parser');
const writeFile = Util.promisify(Fs.writeFile);

async function main() {
	const flags = yargsParser(process.argv.slice(2));

	const missing = ['in', 'out'].filter(
		flag => !flags.hasOwnProperty(flag) || typeof flags[flag] !== 'string'
	);

	const analyzeBuiltins = flags.hasOwnProperty('builtins') ? flags.builtins : false;

	if (missing.length > 0) {
		console.error(`missing required flags: ${missing.map(m => `--${m}`).join(', ')}`);
		process.exit(1);
	}

	const cwd = flags.cwd || process.cwd();
	const path = Path.resolve(cwd, flags.in);
	const outPath = flags.out ? Path.resolve(cwd, flags.out) : '';
	const analysis = await Analyzer.analyze(path, { analyzeBuiltins });

	if (analysis.type === Types.LibraryAnalysisResultType.Error) {
		console.trace(analysis.error);
		process.exit(1);
		return;
	}

	const project = Model.Project.create({ name: 'Project', draft: true, path: 'project' });
	const library = Model.PatternLibrary.fromAnalysis(analysis.result, {
		project,
		analyzeBuiltins,
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
