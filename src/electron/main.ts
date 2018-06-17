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

async function main(): Promise<void> {
	const StartApp = importFresh('./start-app');
	const startApp = StartApp.startApp as typeof start;
	const app = await startApp(CONTEXT);

	app.emitter.on('reload', () => {
		clearModule.match(new RegExp(`^${Path.join(__dirname, '..')}`));
		main();
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
