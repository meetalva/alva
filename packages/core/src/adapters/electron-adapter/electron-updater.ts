import * as M from '../../message';
import * as Types from '../../types';
import * as AU from 'electron-updater';
import * as uuid from 'uuid';
import * as isDev from 'electron-is-dev';
import * as Path from 'path';

export class ElectronUpdater {
	private readonly server: Types.AlvaServer;
	private updater: typeof AU.autoUpdater;

	public constructor({ server }: Types.ElectronAdapterInit) {
		this.server = server;

		this.updater = require('electron-updater').autoUpdater;
		this.updater.autoDownload = false;

		this.updater.logger = {
			debug: server.host.log,
			error: server.host.log,
			info: server.host.log,
			warn: server.host.log
		};

		if (isDev) {
			const updateConfigPath = Path.resolve(__dirname, '..', '..', '..', 'dev-app-update.yml');
			this.updater.updateConfigPath = updateConfigPath;
			this.server.host.log(`Dev mode, using update config from ${updateConfigPath}`);
		}
	}

	public start() {
		this.updater.logger!.info('Starting autoupdater');

		this.updater.on('update-available', (info: AU.UpdateInfo) => {
			this.updater.logger!.info('Update available');

			this.server.sender.send({
				id: uuid.v4(),
				type: M.MessageType.UpdateAvailable,
				payload: info
			});
		});

		this.updater.on('error', (error: Error) => {
			this.updater.logger!.error(`Error while checking for updates ${error.message}`);

			if (error.message === 'net::ERR_INTERNET_DISCONNECTED') {
				return;
			}

			this.server.sender.send({
				id: uuid.v4(),
				type: M.MessageType.UpdateError,
				payload: {
					error: {
						message: error.message
					}
				}
			});
		});

		this.updater.signals.progress(progress => {
			this.updater.logger!.error(`Update progress: ${progress.percent}`);

			this.server.sender.send({
				id: uuid.v4(),
				type: M.MessageType.UpdateDownloadProgress,
				payload: progress
			});
		});

		this.updater.signals.updateDownloaded(info => {
			this.updater.logger!.error(`Update downloaded: ${info.version}`);

			this.server.sender.send({
				id: uuid.v4(),
				type: M.MessageType.UpdateDownloaded,
				payload: info
			});
		});
	}

	public async check(opts: { eager: boolean }): Promise<Types.UpdateCheck> {
		try {
			const updateInfo = await this.updater.checkForUpdates();

			if (updateInfo !== null) {
				return { status: Types.UpdateCheckStatus.Available, info: updateInfo.updateInfo };
			}

			return {
				status: Types.UpdateCheckStatus.Unavailable,
				currentVersion: this.updater.currentVersion
			};
		} catch (err) {
			if (!opts.eager && err.message === 'net::ERR_INTERNET_DISCONNECTED') {
				return {
					status: Types.UpdateCheckStatus.Unavailable,
					currentVersion: this.updater.currentVersion
				};
			}

			throw err;
		}
	}

	public async download(): Promise<Types.UpdateDownloadResult> {
		try {
			await this.updater.downloadUpdate();
			return { status: 'ok' };
		} catch (error) {
			return { status: 'error', error };
		}
	}

	public async install(): Promise<void> {
		this.updater.quitAndInstall();
	}
}
