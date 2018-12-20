const Path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const yargs = require('yargs-parser');
const flags = yargs(process.argv.slice(2));
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

module.exports = {
	mode: flags.production ? 'production' : 'development',
	devtool: flags.production || flags.sourceMaps ? 'source-maps' : 'eval',
	entry: {
		preview: require.resolve('./src/preview/preview.ts'),
		previewRenderer: require.resolve('./src/preview-renderer/index.ts'),
		renderer: require.resolve('./src/renderer/index.tsx'),
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
			output: '/scripts/'
		}),
		new HardSourceWebpackPlugin({
			environmentHash: {
				root: Path.join(process.cwd(), '..', '..'),
				directories: ['packages/core/src'],
				files: ['yarn.lock', 'packages/core/tsconfig.json'],
			},
		})
	],
	externals: {
		mobx: 'Mobx'
	},
	output: {
		filename: '[name].js',
		library: '[name]',
		libraryTarget: 'window',
		path: Path.join(__dirname, 'build', 'scripts'),
		publicPath: '/scripts/'
	}
};
