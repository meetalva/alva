import * as Path from 'path';
import * as Readline from 'readline';
import { startApp as start } from './start-app';
import { AlvaContext } from './alva-context';

const clearModule = require('clear-module');
const importFresh = require('import-fresh');

async function main(): Promise<void> {
	const ctx = await AlvaContext.fromArgv(process.argv);

	const StartApp = importFresh('./start-app');
	const startApp = StartApp.startApp as typeof start;

	const app = await startApp(ctx);

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

	// TODO: Restore
	// CONTEXT.fileToOpen = path;
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
