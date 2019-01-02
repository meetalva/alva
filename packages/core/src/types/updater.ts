import { AlvaServer } from './server';

export interface ElectronAdapterInit {
	server: AlvaServer;
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

export interface UpdateDownloadProgress {
	total: number;
	delta: number;
	transferred: number;
	percent: number;
	bytesPerSecond: number;
}

export interface UpdateInfo {
	version: string;
	files: { url: string; size?: number; blockMapSize?: number; sha512: string }[];
	path: string;
	releaseName?: string | null;
	releaseNotes?: string | Array<unknown> | null;
	releaseDate: string;
}

export interface AvailableUpdate {
	status: UpdateCheckStatus.Available;
	info: UpdateInfo;
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
