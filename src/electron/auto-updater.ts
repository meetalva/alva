import { BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

let showUpdateNotAvailable = false;
let window: BrowserWindow;

export function checkForUpdates(win: BrowserWindow, startedByUser?: boolean): void {
	autoUpdater.autoDownload = false;
	showUpdateNotAvailable = startedByUser || false;
	window = win;
	autoUpdater.checkForUpdatesAndNotify().catch(() => {
		dialog.showErrorBox('Check for Updates', 'Error while checking for updates.');
	});
}

autoUpdater.on('update-available', info => {
	dialog.showMessageBox(
		{
			type: 'info',
			message: `There is a new version available: ${
				info.version
			} \nShould Alva download the update?`,
			buttons: ['yes', 'no']
		},
		buttonIndex => {
			if (buttonIndex === 0) {
				autoUpdater.downloadUpdate().catch(() => {
					dialog.showErrorBox(
						'Check for Updates',
						'An error occured while updating. Please try again manually.'
					);
				});
			}
		}
	);
});

autoUpdater.on('update-not-available', info => {
	if (showUpdateNotAvailable) {
		dialog.showMessageBox({ message: 'Alva is up-to-date.' });
	}
});

autoUpdater.on('error', () => {
	dialog.showErrorBox(
		'Check for Updates',
		'An error occured while updating. Please try again manually.'
	);
});

autoUpdater.on('download-progress', progressObj => {
	window.setProgressBar(progressObj.percent / 100);
});

autoUpdater.on('update-downloaded', info => {
	dialog.showMessageBox({ message: 'Update downloaded. Will be installed on next restart.' });

	// remove progress bar
	window.setProgressBar(-1);
});
