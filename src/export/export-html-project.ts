import * as Fs from 'fs';
import * as Model from '../model';
import * as Types from '../types';
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

	const previewProject = Model.Project.from(project.toJSON());
	const firstPage = project.getPages()[0];

	previewProject.getPages().forEach(p => p.setActive(false));
	firstPage.setActive(true);

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
