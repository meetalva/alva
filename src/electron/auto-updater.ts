import { sendStatusToWindow } from './electron';
import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

// autoUpdater.logger = log;

export function checkForUpdates(): void {
	autoUpdater.checkForUpdatesAndNotify().catch(() => {
		sendStatusToWindow('Error in auto-updater.');
	});
}

autoUpdater.checkForUpdatesAndNotify().catch(() => {
	sendStatusToWindow('Error in auto-updater.');
});

autoUpdater.on('checking-for-update', info => {
	sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', info => {
	sendStatusToWindow('Update available.');
	dialog.showMessageBox({ message: `There is a new Alva version: ${info.version}` });
});

autoUpdater.on('update-not-available', info => {
	sendStatusToWindow('Update not available.');
});

autoUpdater.on('error', err => {
	sendStatusToWindow(`Error in auto-updater. ${err}`);
});

autoUpdater.on('download-progress', progressObj => {
	let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
	log_message = `${log_message} - Downloaded ${progressObj.percent}%`;
	log_message = `${log_message} (${progressObj.transferred}/${progressObj.total})`;
	sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', info => {
	sendStatusToWindow('Update downloaded');
});
