import { compilerSafeName } from './compiler-safe-name';
import * as Path from 'path';
import * as webpack from 'webpack';
import { ufs } from 'unionfs';
import * as Fs from 'fs';

const MemoryFs = require('memory-fs');

export interface CompilerPattern {
	id: string;
	path: string;
}

export function createCompiler(
	patterns: CompilerPattern[],
	options: { id: string; cwd: string; infrastructure: boolean }
): webpack.Compiler {
	const inputFs = new MemoryFs();
	inputFs.mkdirpSync(options.cwd);

	const layeredInputFileSystem = ufs.use(inputFs).use(Fs);
	const outputFs = new MemoryFs();

	const entryFile = createEntryFile(patterns);
	inputFs.writeFileSync(inputFs.join(options.cwd, `/${options.id}.js`), entryFile);

	const compiler = webpack({
		mode: 'development',
		context: options.cwd,
		entry: {
			[options.id]: inputFs.join(options.cwd, `/${options.id}.js`)
		},
		output: {
			filename: '[name].js',
			library: '[name]',
			libraryTarget: 'window',
			path: '/'
		}
	});

	compiler.inputFileSystem = layeredInputFileSystem as any;
	compiler.outputFileSystem = outputFs;

	return compiler;
}

function createEntryFile(components: CompilerPattern[]): string {
	return components
		.map(pattern => ({
			id: compilerSafeName(pattern.id),
			path: pattern.path.split(Path.sep).join('/')
		}))
		.reduce<string[]>(
			(entryFile, pattern) => [
				...entryFile,
				`module.exports['${pattern.id}'] = require('${pattern.path}')`
			],
			[]
		)
		.join(';\n');
}
