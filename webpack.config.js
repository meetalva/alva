const Path = require('path');

const MOBX_PATH = require.resolve('mobx');
const HTML_SKETCHAPP_PATH = require.resolve('@brainly/html-sketchapp');

const PREVIEW_PATH = require.resolve('./src/preview/preview.ts');
const EXPORT_TO_SKETCH_DATA_PATH = require.resolve('./src/preview/export-to-sketch-data.ts');

const RENDERER_PATH = require.resolve('./src/preview-renderer/index.ts');

module.exports = [
	{
		mode: 'production',
		entry: {
			exportToSketchData: EXPORT_TO_SKETCH_DATA_PATH,
			preview: PREVIEW_PATH,
			renderer: RENDERER_PATH
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
		mode: 'production',
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
		mode: 'production',
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
