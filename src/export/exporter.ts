import { WebviewTag } from 'electron';
import * as Fs from 'fs';
import * as Util from 'util';

const writeFile = Util.promisify(Fs.writeFile);

export interface ExportResult {
	error?: Error;
	result?: Buffer;
}

export interface ExportWriteResult {
	error?: Error;
}

export abstract class Exporter {
	public contents: Buffer;

	public abstract async createExport(webview: WebviewTag): Promise<ExportResult>;

	public async writeToDisk(path: string): Promise<ExportWriteResult> {
		try {
			await writeFile(path, this.contents);
			return {};
		} catch (error) {
			return { error };
		}
	}
}
