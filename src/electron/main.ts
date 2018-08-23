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
	port: undefined,
	project: undefined,
	sender: undefined,
	win: undefined,
	hot: undefined
});

async function main(): Promise<void> {
	const args = yargsParser(process.argv.slice(2));
	CONTEXT.hot = args.hot || false;

	const StartApp = importFresh('./start-app');
	const startApp = StartApp.startApp as typeof start;
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

Electron.app.on('ready', main);

Electron.app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		Electron.app.quit();
	}
});

process.on('unhandledRejection', reason => {
	console.error(reason);
});
