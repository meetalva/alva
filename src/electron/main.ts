import * as Electron from 'electron';
import * as Path from 'path';
import { AppContext, startApp as start } from './start-app';

const clearModule = require('clear-module');
const importFresh = require('import-fresh');

const CONTEXT: AppContext = {
	port: undefined,
	sender: undefined,
	win: undefined
};

let restarting: Promise<void> = Promise.resolve();

async function main(): Promise<void> {
	const StartApp = importFresh('./start-app');
	const startApp = StartApp.startApp as typeof start;
	const app = await startApp(CONTEXT);

	const restart = async () => {
		clearModule.match(new RegExp(`^${Path.join(__dirname, '..')}`));
		await main();
		restarting = Promise.resolve();
	};

	app.emitter.on('reload', async () => {
		await restarting;
		restarting = restart();
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
