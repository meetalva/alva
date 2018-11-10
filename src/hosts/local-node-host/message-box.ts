// Program is started with electron executable by ./index.ts
// * LocalNodeHost.prototype.showError
import * as Electron from 'electron';

const flags = require('yargs-parser')(process.argv.slice(2), {
	array: ['properties']
});

Electron.app.on('ready', () => {
	Electron.app.focus();

	Electron.dialog.showMessageBox(flags, response => {
		console.log(JSON.stringify(response));
		process.nextTick(() => {
			Electron.app.exit();
		});
	});
});
