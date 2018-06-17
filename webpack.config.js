const Path = require('path');

const MOBX_PATH = require.resolve('mobx');
const PREVIEW_PATH = require.resolve('./src/preview/preview.ts');
const RENDERER_PATH = require.resolve('./src/preview-renderer/index.ts');

module.exports = [{
	mode: 'development',
	entry: {
		Mobx: MOBX_PATH,
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
		mobx: 'Mobx'
	},
	output: {
		filename: '[name].js',
		library: '[name]',
		libraryTarget: 'window',
		path: Path.join(__dirname, 'build', 'scripts')
	}
}, {
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
}];
