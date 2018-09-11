import * as Fs from 'fs';
import * as Model from '../model';
import * as Types from '../types';
import fetch from 'node-fetch';

const MemoryFileSystem = require('memory-fs');

export async function exportSketchPage({
	page,
	port
}: {
	page: Model.Page;
	port: number | undefined;
}): Promise<Types.ExportResult> {
	const fs = new MemoryFileSystem() as typeof Fs;
	const response = await fetch(`http://localhost:${port}/sketch/${page.getId()}.json`);
	const data = await response.json();
	fs.writeFileSync(`/${page.getId()}.json`, JSON.stringify(data));

	return {
		type: Types.ExportResultType.ExportSuccess,
		fs
	};
}
