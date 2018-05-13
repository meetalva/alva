// import * as Path from 'path';
// import { patternIdToWebpackName } from './pattern-id-to-webpack-name';
import * as QueryString from 'query-string';
import { PatternLibrary } from '../store';
import * as webpack from 'webpack';

// memory-fs typings on @types are faulty
const MemoryFs = require('memory-fs');

const PREVIEW_PATH = require.resolve('./preview');
const LOADER_PATH = require.resolve('./preview-loader');
const RENDERER_PATH = require.resolve('./preview-renderer');

interface StyleguidePattern {
	[key: string]: string;
}

export function createCompiler(styleguide: PatternLibrary): webpack.Compiler {
	// const context = styleguide.getPath();
	const context = process.cwd();

	/*const components =  styleguide.getPatterns().reduce((componentMap, pattern) => {
		const patternPath = pattern.getImplementationPath();

		if (!patternPath) {
			return componentMap;
		}

		componentMap[patternIdToWebpackName(pattern.getId())] = `./${Path.relative(
			context,
			patternPath
		)
			.split(Path.sep)
			.join('/')}`;
		return componentMap;
	}, init); */
	const components: StyleguidePattern = {};

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
		optimization: {
			splitChunks: {
				cacheGroups: {
					vendor: {
						chunks: 'initial',
						name: 'vendor',
						test: /node_modules/,
						priority: 10,
						enforce: true
					}
				}
			}
		},
		plugins: [new webpack.HotModuleReplacementPlugin()]
	});

	compiler.outputFileSystem = new MemoryFs();

	return compiler;
}
