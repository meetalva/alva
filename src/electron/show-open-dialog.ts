import * as Electron from 'electron';

export const showOpenDialog = (options: Electron.OpenDialogOptions): Promise<string[]> =>
	new Promise(resolve =>
		Electron.dialog.showOpenDialog(Electron.BrowserWindow.getFocusedWindow(), options, resolve)
	);
