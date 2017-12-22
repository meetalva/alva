import { BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

// autoUpdater.logger = log;

export function checkForUpdates(win: BrowserWindow): void {
	autoUpdater.checkForUpdatesAndNotify().catch(() => {
		dialog.showErrorBox('Check for Updates', 'Error while checking for updates');
	});

	autoUpdater.on('update-available', info => {
		dialog.showMessageBox({ message: `There is a new Alva version: ${info.version}` });
	});

	autoUpdater.on('error', () => {
		dialog.showErrorBox('Check for Updates', 'Error on receiving update. Please try manually');
	});

	autoUpdater.on('download-progress', progressObj => {
		win.setProgressBar(progressObj.percent);
	});

	autoUpdater.on('update-downloaded', info => {
		dialog.showMessageBox({ message: 'Update downloaded. Will be installed on next restart' });
	});
}
