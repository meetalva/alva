import { BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

const registry: Map<BrowserWindow, { showUpdateNotAvailable: boolean }> = new Map();
const windows: Set<BrowserWindow> = new Set();

export async function checkForUpdates(win: BrowserWindow, startedByUser?: boolean): Promise<void> {
	autoUpdater.autoDownload = false;

	windows.add(win);

	registry.set(win, {
		showUpdateNotAvailable: startedByUser || false
	});

	try {
		await autoUpdater.checkForUpdatesAndNotify();
	} catch {
		dialog.showErrorBox('Check for Updates', 'Error while checking for updates.');
	}
}

export function startUpdater(): void {
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
		windows.forEach(window => {
			const context = registry.get(window);
			if (context && context.showUpdateNotAvailable) {
				dialog.showMessageBox({ message: 'Alva is up-to-date.' });
			}
		});
	});

	autoUpdater.on('error', () => {
		dialog.showErrorBox(
			'Check for Updates',
			'An error occured while updating. Please try again manually.'
		);
	});

	autoUpdater.on('download-progress', progressObj => {
		windows.forEach(window => {
			window.setProgressBar(progressObj.percent / 100);
		});
	});

	autoUpdater.on('update-downloaded', info => {
		dialog.showMessageBox({ message: 'Update downloaded. Will be installed on next restart.' });

		// remove progress bar
		windows.forEach(window => {
			window.setProgressBar(-1);
		});
	});
}

export function stopUpdater(): void {
	autoUpdater.removeAllListeners();
}
