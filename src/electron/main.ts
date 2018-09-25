import * as Electron from 'electron';
import * as Mobx from 'mobx';
import * as Path from 'path';
import * as Readline from 'readline';
import { AppContext, startApp as start } from './start-app';

const yargsParser = require('yargs-parser');
const clearModule = require('clear-module');
const importFresh = require('import-fresh');

const CONTEXT: AppContext = Mobx.observable({
	app: undefined,
	appPath: Electron.app.getPath('userData'),
	base: '',
	port: undefined,
	project: undefined,
	sender: undefined,
	win: undefined,
	hot: undefined,
	middlewares: [],
	fileToOpen: undefined
});

async function main(): Promise<void> {
	const args = yargsParser(process.argv.slice(2));
	const fileToOpen = args._.length > 0 ? args._[0] : '';

	if (fileToOpen && Path.extname(fileToOpen) === '.alva') {
		CONTEXT.fileToOpen = fileToOpen;
	}

	CONTEXT.hot = args.hot || false;
	CONTEXT.base = args.base || '';

	const StartApp = importFresh('./start-app');
	const startApp = StartApp.startApp as typeof start;

	if (CONTEXT.hot) {
		const webpack = require('webpack');
		const webpackConfig = require('../../webpack.config');

		const compiler = webpack(webpackConfig);

		const devWare = require('webpack-dev-middleware')(compiler, {
			noInfo: true,
			publicPath: webpackConfig.output.publicPath
		});

		const hotWare = require('webpack-hot-middleware')(compiler);

		CONTEXT.middlewares = [devWare, hotWare];
	}

	const app = await startApp(CONTEXT);

	const rl = Readline.createInterface({
		input: process.stdin,
		terminal: false
	});

	rl.on('line', line => {
		if (!line.endsWith('rs')) {
			return;
		}

		Readline.moveCursor(process.stdin, 0, -1);
		Readline.clearLine(process.stdin, 0);
		app.emitter.emit('reload', { forced: true });
	});

	app.emitter.once('reload', async () => {
		clearModule.match(new RegExp(`^${Path.join(__dirname, '..')}`));
		await main();
	});
}

Electron.app.on('open-file', async (event, path) => {
	event.preventDefault();

	if (!path) {
		return;
	}

	CONTEXT.fileToOpen = path;
});

Electron.app.on('ready', main);

Electron.app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		Electron.app.quit();
	}
});

process.on('unhandledRejection', reason => {
	console.error(reason);
});
