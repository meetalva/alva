const Path = require('path');

const RENDERER_PATH = require.resolve('./src/renderer/index.tsx');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const webpack = require('webpack');

module.exports = {
	mode: 'development',
	entry: {
		renderer: RENDERER_PATH
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				options: {
					transpileOnly: true
				}
			}
		]
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new MonacoWebpackPlugin()
	],
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},
	node: {
		__dirname: false
	},
	output: {
		filename: '[name].js',
		path: Path.join(__dirname, 'build', 'scripts'),
		publicPath: 'http://localhost:8080/scripts/',
	},
	devtool: 'eval',
	devServer: {
		hot: true,
		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	}
};
