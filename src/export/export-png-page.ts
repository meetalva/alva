import * as Fs from 'fs';
import * as Model from '../model';
import * as Types from '../types';
import fetch from 'node-fetch';

const MemoryFileSystem = require('memory-fs');

export async function exportPngPage({
	page,
	port
}: {
	page: Model.Page;
	port: number | undefined;
}): Promise<Types.ExportResult> {
	const fs = new MemoryFileSystem() as typeof Fs;
	const response = await fetch(`http://localhost:${port}/screenshots/${page.getId()}.png`);
	const image = await response.buffer();

	fs.writeFileSync(`/${page.getId()}.png`, image);

	return {
		type: Types.ExportResultType.ExportSuccess,
		fs
	};
}
