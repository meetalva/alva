// Program is started with electron executable by ./index.ts
// * LocalNodeHost.prototype.selectFile
import * as Electron from 'electron';

const flags = require('yargs-parser')(process.argv.slice(2), {
	array: ['properties']
});

Electron.app.on('ready', () => {
	Electron.app.focus();

	Electron.dialog.showOpenDialog(flags, paths => {
		console.log(JSON.stringify(paths || []));
		process.nextTick(() => {
			Electron.app.exit();
		});
	});
});
