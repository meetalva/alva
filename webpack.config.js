const Path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const webpack = require('webpack');

module.exports = {
	mode: 'development',
	entry: {
		exportToSketchData: require.resolve('./src/preview/export-to-sketch-data.ts'),
		preview: require.resolve('./src/preview/preview.ts'),
		previewRenderer: require.resolve('./src/preview-renderer/index.ts'),
		renderer: [
			require.resolve('./src/renderer/index.tsx'),
			'webpack-hot-middleware/client'
		],
		Mobx: require.resolve('mobx')
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				options: {
					transpileOnly: true
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
		new webpack.HotModuleReplacementPlugin(),
		new MonacoWebpackPlugin({
			languages: ['typescript'],
			output: '/scripts/'
		})
	],
	externals: {
		mobx: 'Mobx',
		exportToSketchData: 'exportToSketchData'
	},
	output: {
		filename: '[name].js',
		library: '[name]',
		libraryTarget: 'window',
		path: Path.join(__dirname, 'build', 'scripts'),
		publicPath: '/scripts/'
	},
	devServer: {
		hotOnly: true
	}
};
