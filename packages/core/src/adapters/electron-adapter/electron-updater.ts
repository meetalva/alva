import * as M from '../../message';
import * as Types from '../../types';
import * as AU from 'electron-updater';
import * as uuid from 'uuid';

export interface ElectronAdapterInit {
	server: Types.AlvaServer;
}

export enum UpdateCheckStatus {
	Available,
	Unavailable,
	Error
}

export type UpdateCheck = UnavailableUpdate | AvailableUpdate | ErroredUpdate;

export interface UnavailableUpdate {
	status: UpdateCheckStatus.Unavailable;
	currentVersion: { version: string };
}

export interface AvailableUpdate {
	status: UpdateCheckStatus.Available;
	info: AU.UpdateCheckResult;
}

export interface ErroredUpdate {
	status: UpdateCheckStatus.Error;
	error: Error;
}

export type UpdateDownloadResult = UpdateDownloadSuccess | UpdateDownloadError;

export interface UpdateDownloadSuccess {
	status: 'ok';
}

export interface UpdateDownloadError {
	status: 'error';
	error: Error;
}

export class ElectronUpdater {
	private readonly server: Types.AlvaServer;
	private updater: typeof AU.autoUpdater;

	public constructor({ server }: ElectronAdapterInit) {
		this.server = server;

		this.updater = require('electron-updater').autoUpdater;
		this.updater.autoDownload = false;
	}

	public start() {
		this.updater.on('update-available', (info: AU.UpdateInfo) => {
			const releaseNotes = Array.isArray(info.releaseNotes)
				? info.releaseNotes.map(n => n.note).join('\n')
				: info.releaseNotes;

			this.server.sender.send({
				id: uuid.v4(),
				type: M.MessageType.UpdateAvailable,
				payload: {
					version: info.version,
					releaseDate: info.releaseDate,
					releaseName: info.releaseName,
					releaseNotes
				}
			});
		});

		this.updater.on('error', (error: Error) => {
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

		// TODO: Type this
		this.updater.on('download-progress', (progress: unknown) => {
			this.server.sender.send({
				id: uuid.v4(),
				type: M.MessageType.UpdateDownloadProgress,
				payload: progress
			});
		});

		// TODO: Type this
		this.updater.on('update-downloaded', (info: unknown) => {
			this.server.sender.send({
				id: uuid.v4(),
				type: M.MessageType.UpdateDownloaded,
				payload: info
			});
		});
	}

	public async check(opts: { eager: boolean }): Promise<UpdateCheck> {
		try {
			const updateInfo = await this.updater.checkForUpdatesAndNotify();

			if (updateInfo !== null) {
				return { status: UpdateCheckStatus.Available, info: updateInfo };
			}

			return {
				status: UpdateCheckStatus.Unavailable,
				currentVersion: this.updater.currentVersion
			};
		} catch (err) {
			if (!opts.eager && err.message === 'net::ERR_INTERNET_DISCONNECTED') {
				return {
					status: UpdateCheckStatus.Unavailable,
					currentVersion: this.updater.currentVersion
				};
			}

			throw err;
		}
	}

	public async download(): Promise<UpdateDownloadResult> {
		try {
			await this.updater.downloadUpdate();
			return { status: 'ok' };
		} catch (error) {
			return { status: 'error', error };
		}
	}
}
