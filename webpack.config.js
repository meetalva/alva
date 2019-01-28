const Path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const yargs = require('yargs-parser');
const flags = yargs(process.argv.slice(2));

const out = flags.out ? flags.out : './packages/core/lib';

module.exports = {
	mode: flags.production ? 'production' : 'development',
	devtool: flags.production || flags.sourceMaps ? 'source-maps' : 'cheap-source-map',
	entry: {
		preview: require.resolve('./packages/core/src/preview/preview.ts'),
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
		})
	],
	externals: {
		mobx: 'Mobx',
		osenv: false,
		child_process: false
	},
	output: {
		filename: '[name].js',
		library: '[name]',
		libraryTarget: 'window',
		path: Path.join(__dirname, out, 'scripts'),
		publicPath: '/scripts/'
	}
};
