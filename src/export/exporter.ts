export interface ExportWriteResult {
	error?: Error;
}

export abstract class Exporter {
	public contents: Buffer;

	public abstract execute(path: string): void;
}
