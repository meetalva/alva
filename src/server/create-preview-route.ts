import * as Express from 'express';
import * as PreviewDocument from '../preview-document';
import { Sender } from '../sender/server';
import * as Types from '../types';
import * as Model from '../model';

export interface PreviewRouteOptions {
	sender: Sender | undefined;
	project: Model.Project | undefined;
}

export function createPreviewRoute(options: PreviewRouteOptions): Express.RequestHandler {
	return async function previewRoute(req: Express.Request, res: Express.Response): Promise<void> {
		res.type('html');

		const { project } = options;

		if (!project) {
			res.sendStatus(404);
			return;
		}

		const userLibraries = project
			.getPatternLibraries()
			.filter(lib => lib.getOrigin() === Types.PatternLibraryOrigin.UserProvided);

		const script = lib =>
			`<script src="/libraries/${lib.getId()}.js" data-bundle="${lib.getBundleId()}"></script>`;

		res.send(
			PreviewDocument.previewDocument({
				data: project.toJSON(),
				scripts: userLibraries.map(script)
			})
		);
	};
}
