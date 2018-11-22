import * as Fs from 'fs';
import * as Model from '../model';
import * as Types from '../types';
import fetch from 'node-fetch';

const MemoryFileSystem = require('memory-fs');

export async function exportHtmlProject({
	project,
	port
}: {
	project: Model.Project;
	port?: number;
}): Promise<Types.ExportResult> {
	const fs = new MemoryFileSystem() as typeof Fs;
	const response = await fetch(`http://localhost:${port}/project/export/${project.getId()}/`);
	const doc = await response.buffer();

	fs.writeFileSync(`/${project.getId()}.html`, doc);

	return {
		type: Types.ExportResultType.ExportSuccess,
		fs
	};
}
