import * as Fs from 'fs';
import * as Path from 'path';
import * as Util from 'util';
import * as Model from '@meetalva/model';
import * as Analyzer from '@meetalva/analyzer';
import * as Types from '@meetalva/types';

const yargsParser = require('yargs-parser');
const writeFile = Util.promisify(Fs.writeFile);

async function main() {
	const write = process.stdout.write.bind(process.stdout);
	const flags = yargsParser(process.argv.slice(2));

	const missing = ['in', 'out'].filter(
		flag => !flags.hasOwnProperty(flag) || typeof flags[flag] !== 'string'
	);

	const toFile = flags.out !== 'false';

	if (!toFile) {
		process.stdout.write = () => false;
	}

	const analyzeBuiltins = flags.hasOwnProperty('builtins') ? flags.builtins : false;

	if (missing.length > 0) {
		console.error(`missing required flags: ${missing.map(m => `--${m}`).join(', ')}`);
		process.exit(1);
	}

	const cwd = flags.cwd || process.cwd();
	const path = Path.resolve(cwd, flags.in);
	const outPath = flags.out ? Path.resolve(cwd, flags.out) : '';
	const analysis = await Analyzer.analyze(path, { analyzeBuiltins });
	const format = typeof flags.format === 'undefined' ? 'ts' : flags.format;

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

	if (toFile) {
		await writeFile(outPath, formatLibrary(library, format));
	} else {
		write(formatLibrary(library, format));
	}
}

function formatLibrary(library: Model.PatternLibrary, format: string): string {
	switch (format) {
		case 'json':
			return JSON.stringify(library.toJSON(), null, '  ');
		case 'js':
		case 'ts':
			return `export const analysis = ${JSON.stringify(library.toJSON(), null, '  ')}`;
		default:
			throw new Error(`Unknown format: ${format}`);
	}
}

main().catch(err => {
	throw err;
});
