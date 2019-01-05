import * as M from '../../message';
import * as Types from '../../types';
import * as AU from 'electron-updater';
import * as uuid from 'uuid';
import * as isDev from 'electron-is-dev';
import * as Path from 'path';
import * as semver from 'semver';

export class ElectronUpdater {
	private readonly server: Types.AlvaServer;
	private updater: typeof AU.autoUpdater;
	private force: boolean = false;

	public constructor({ server, force }: Types.ElectronUpdaterInit) {
		this.server = server;
		this.force = force;

		this.updater = require('electron-updater').autoUpdater;
		this.updater.autoDownload = false;
		this.updater.autoInstallOnAppQuit = false;
		this.updater.allowDowngrade = false;

		this.updater.logger = {
			debug: server.host.log,
			error: server.host.log,
			info: server.host.log,
			warn: server.host.log
		};

		if (isDev && this.force) {
			const updateConfigPath = Path.resolve(__dirname, '..', '..', '..', 'dev-app-update.yml');
			this.updater.updateConfigPath = updateConfigPath;
			this.server.host.log(`Dev mode, using update config from ${updateConfigPath}`);
		}
	}

	public start() {
		if (isDev && !this.force) {
			return;
		}

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

			if (
				error.message === 'net::ERR_INTERNET_DISCONNECTED' ||
				error.message === 'net::ERR_CONNECTION_REFUSED'
			) {
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
			this.updater.logger!.info(`Update progress: ${progress.percent}`);

			this.server.sender.send({
				id: uuid.v4(),
				type: M.MessageType.UpdateDownloadProgress,
				payload: progress
			});
		});

		this.updater.signals.updateDownloaded(info => {
			this.updater.logger!.info(`Update downloaded: ${info.version}`);

			this.server.sender.send({
				id: uuid.v4(),
				type: M.MessageType.UpdateDownloaded,
				payload: info
			});
		});
	}

	public async check(opts: { eager: boolean }): Promise<Types.UpdateCheck> {
		if (isDev && !this.force) {
			// tslint:disable-next-line:no-empty
			return new Promise(() => {});
		}

		try {
			const updateInfo = await this.updater.checkForUpdates();

			if (
				updateInfo !== null &&
				semver.gt(updateInfo.versionInfo.version, this.updater.currentVersion)
			) {
				return { status: Types.UpdateCheckStatus.Available, info: updateInfo.updateInfo };
			}

			return {
				status: Types.UpdateCheckStatus.Unavailable,
				currentVersion: this.updater.currentVersion
			};
		} catch (err) {
			if (
				err.message === 'net::ERR_INTERNET_DISCONNECTED' ||
				err.message === 'net::ERR_CONNECTION_REFUSED'
			) {
				return {
					status: Types.UpdateCheckStatus.Unavailable,
					currentVersion: this.updater.currentVersion
				};
			} else {
				throw err;
			}
		}
	}

	public async download(): Promise<Types.UpdateDownloadResult> {
		if (isDev && !this.force) {
			// tslint:disable-next-line:no-empty
			return new Promise(() => {});
		}

		try {
			await this.updater.downloadUpdate();
			return { status: 'ok' };
		} catch (error) {
			return { status: 'error', error };
		}
	}

	public async install(): Promise<void> {
		if (isDev && !this.force) {
			return;
		}

		this.updater.quitAndInstall();
	}
}
