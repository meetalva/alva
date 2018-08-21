import * as Express from 'express';
import * as PreviewDocument from '../preview-document';
import { Sender } from '../sender/server';
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

		const clone = Model.Project.from(project.toJSON());
		clone.getPatternLibraries().map(l => l.setBundle(''));

		res.send(
			PreviewDocument.previewDocument({
				data: clone.toJSON(),
				scripts: project
					.getPatternLibraries()
					.map(
						lib =>
							`<script src="/libraries/${lib.getId()}.js" data-bundle="${lib.getBundleId()}"></script>`
					)
			})
		);
	};
}
