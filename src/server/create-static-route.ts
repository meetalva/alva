import * as Express from 'express';
import * as Path from 'path';
import * as PreviewDocument from '../preview-document';
import { Sender } from '../sender/server';
import * as Model from '../model';

export interface StaticRouteOptions {
	project: Model.Project | undefined;
	sender: Sender | undefined;
}

export function createStaticRoute(options: StaticRouteOptions): Express.RequestHandler {
	return async function staticRoute(req: Express.Request, res: Express.Response): Promise<void> {
		res.type('html');

		if (!options.project) {
			res.send(404);
			return;
		}

		const project = options.project;
		const firstPage = project.getPages()[0];

		const id = Path.basename(req.path, Path.extname(req.path));

		if (!id && !firstPage) {
			res.sendStatus(404);
			return;
		}

		if (!id && firstPage) {
			res.redirect(`${firstPage.getId()}.html`);
			return;
		}

		const page = project.getPageById(id);

		if (!page) {
			res.sendStatus(404);
			return;
		}

		project.getPages().forEach(p => p.setActive(false));
		page.setActive(true);

		res.send(
			PreviewDocument.staticDocument({
				data: project.toJSON(),
				scripts: project
					.getPatternLibraries()
					.map(lib => `<script data-bundle="${lib.getBundleId()}">${lib.getBundle()}</script>`)
			})
		);
	};
}
