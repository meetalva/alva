import * as Fs from 'fs';

export type ExportResult = ExportSuccess | ExportError;

export enum ExportResultType {
	ExportSuccess,
	ExportError
}

export interface ExportSuccess {
	type: ExportResultType.ExportSuccess;
	fs: typeof Fs;
}

export interface ExportError {
	type: ExportResultType.ExportError;
	error: Error;
}

export enum ScreenshotType {
	Png
}
