import * as Fs from 'fs';
import * as Model from '@meetalva/model';
import * as Types from '@meetalva/types';
import * as PreviewDocument from '../preview-document';

const MemoryFileSystem = require('memory-fs');

export async function exportHtmlProject({
	project,
	location
}: {
	project: Model.Project;
	location: Types.Location;
}): Promise<Types.ExportResult> {
	const fs = new MemoryFileSystem() as typeof Fs;

	const previewProject = project.clone();
	const firstPage = previewProject.getPages()[0];

	if (!firstPage) {
		return {
			type: Types.ExportResultType.ExportError,
			error: new Error(`Could not determine leading page for ${previewProject.getName()}`)
		};
	}

	previewProject.setActivePage(firstPage);

	fs.writeFileSync(
		`/${project.getId()}.html`,
		await PreviewDocument.staticDocument({
			location,
			data: previewProject.toJSON(),
			scripts: previewProject
				.getPatternLibraries()
				.map(lib => `<script data-bundle="${lib.getBundleId()}">${lib.getBundle()}</script>`)
		})
	);

	return {
		type: Types.ExportResultType.ExportSuccess,
		fs
	};
}
