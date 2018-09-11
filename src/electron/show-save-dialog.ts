import * as Electron from 'electron';

export const showSaveDialog = (options: Electron.SaveDialogOptions): Promise<string | undefined> =>
	new Promise(resolve =>
		Electron.dialog.showSaveDialog(Electron.BrowserWindow.getFocusedWindow(), options, resolve)
	);
