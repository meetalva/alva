import { compilerSafeName } from './compiler-safe-name';
import * as Path from 'path';
import * as QueryString from 'query-string';
import * as Types from '../model/types';
import * as webpack from 'webpack';

// memory-fs typings on @types are faulty
const MemoryFs = require('memory-fs');

const PREVIEW_PATH = require.resolve('../preview/preview');
const LOADER_PATH = require.resolve('../preview/preview-loader');
const RENDERER_PATH = require.resolve('../preview/preview-renderer');

export function createCompiler(
	patterns: Types.SerializedPattern[],
	options: { cwd: string }
): webpack.Compiler {
	const context = options.cwd || process.cwd();

	const components = patterns.reduce((acc, pattern) => {
		acc[compilerSafeName(pattern.id)] = `./${Path.relative(context, pattern.path)
			.split(Path.sep)
			.join('/')}`;

		return acc;
	}, {});

	const compiler = webpack({
		mode: 'development',
		context,
		entry: {
			components: `${LOADER_PATH}?${QueryString.stringify({
				cwd: context,
				components: JSON.stringify(components)
			})}!`,
			renderer: RENDERER_PATH,
			preview: PREVIEW_PATH
		},
		output: {
			filename: '[name].js',
			library: '[name]',
			libraryTarget: 'window',
			path: '/'
		},
		plugins: [new webpack.HotModuleReplacementPlugin()]
	});

	compiler.outputFileSystem = new MemoryFs();

	return compiler;
}
