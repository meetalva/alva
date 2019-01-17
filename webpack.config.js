// @ts-check
const Path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const Webpack = require('webpack');
const yargs = require('yargs-parser');
const flags = yargs(process.argv.slice(2));

const out = flags.out ? flags.out : './packages/core/lib';

module.exports = {
	mode: flags.production ? 'production' : 'development',
	devtool: flags.production || flags.sourceMaps ? 'source-maps' : 'eval',
	entry: {
		preview: require.resolve('./packages/core/src/preview/preview.ts'),
		createWindowPreload: require.resolve('./packages/core/src/hosts/electron-host/create-window-preload.ts'),
		previewRenderer: require.resolve('./packages/core/src/preview-renderer/index.ts'),
		renderer: require.resolve('./packages/core/src/renderer/index.tsx'),
		Mobx: require.resolve('mobx')
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				options: {
					transpileOnly: true,
					compilerOptions: {
						module: 'esnext'
					}
				}
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			}
		]
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},
	plugins: [
		new MonacoWebpackPlugin({
			languages: ['typescript', 'json'],
			output: ''
		}),
		new Webpack.EnvironmentPlugin(['NODE_ENV'])
	],
	externals: {
		electron: 'commonjs electron',
		mobx: 'Mobx'
	},
	output: {
		filename: '[name].js',
		library: '[name]',
		libraryTarget: 'window',
		path: Path.join(__dirname, out, 'scripts'),
		publicPath: '/scripts/'
	}
};
