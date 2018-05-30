import { compilerSafeName } from './compiler-safe-name';
import * as Fs from 'fs';
import * as Path from 'path';
import * as QueryString from 'query-string';
import * as webpack from 'webpack';

// memory-fs typings on @types are faulty
const MemoryFs = require('memory-fs');

const PREVIEW_PATH = require.resolve('../preview/preview');
const LOADER_PATH = require.resolve('../preview/preview-loader');
const RENDERER_PATH = require.resolve('../preview/preview-renderer');

export interface CompilerPattern {
	id: string;
	path: string;
}

export function createCompiler(
	patterns: CompilerPattern[],
	options: { cwd: string; infrastructure: boolean }
): webpack.Compiler {
	const entry: { [name: string]: string } = {};

	if (options.infrastructure) {
		entry.renderer = RENDERER_PATH;
		entry.preview = PREVIEW_PATH;
	}

	const components = patterns.reduce((acc, pattern) => {
		acc[compilerSafeName(pattern.id)] = `./${Path.relative(options.cwd, pattern.path)
			.split(Path.sep)
			.join('/')}`;
		return acc;
	}, {});

	entry.components = `${LOADER_PATH}?${QueryString.stringify({
		cwd: options.cwd,
		components: JSON.stringify(components)
	})}!`;

	const compiler = webpack({
		mode: 'development',
		context: options.cwd,
		entry,
		output: {
			filename: '[name].js',
			library: '[name]',
			libraryTarget: 'window',
			path: '/'
		}
	});

	compiler.outputFileSystem = new MemoryFs() as typeof Fs;
	return compiler;
}
