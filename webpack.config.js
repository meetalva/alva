const Path = require('path');

const MOBX_PATH = require.resolve('mobx');
const PREVIEW_PATH = require.resolve('./src/preview/preview.ts');
const PREVIEW_RENDERER_PATH = require.resolve('./src/preview-renderer/index.ts');
const EXPORT_TO_SKETCH_DATA_PATH = require.resolve('./src/preview/export-to-sketch-data.ts');

module.exports = [
	require('./webpack.renderer'),
	{
		mode: 'development',
		entry: {
			exportToSketchData: EXPORT_TO_SKETCH_DATA_PATH,
			preview: PREVIEW_PATH,
			previewRenderer: PREVIEW_RENDERER_PATH
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					loader: 'ts-loader',
					options: {
						transpileOnly: true
					}
				}
			]
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js']
		},
		externals: {
			mobx: 'Mobx',
			exportToSketchData: 'exportToSketchData'
		},
		output: {
			filename: '[name].js',
			library: '[name]',
			libraryTarget: 'window',
			path: Path.join(__dirname, 'build', 'scripts')
		}
	},
	{
		mode: 'development',
		entry: {
			exportToSketchData: EXPORT_TO_SKETCH_DATA_PATH
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					loader: 'ts-loader',
					options: {
						transpileOnly: true
					}
				}
			]
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js']
		},
		output: {
			filename: '[name].js',
			library: '[name]',
			libraryTarget: 'window',
			path: Path.join(__dirname, 'build', 'scripts')
		}
	},
	{
		mode: 'development',
		entry: {
			Mobx: MOBX_PATH
		},
		output: {
			filename: '[name].js',
			library: '[name]',
			libraryTarget: 'window',
			path: Path.join(__dirname, 'build', 'scripts')
		}
	}
];
