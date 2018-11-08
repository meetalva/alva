import * as Express from 'express';
import { Sender } from '../sender';
import * as Model from '../model';
import * as Path from 'path';

export interface LibrariesRouteOptions {
	sender: Sender | undefined;
	projects: Map<string, Model.Project>;
}

export function createLibrariesRoute(options: LibrariesRouteOptions): Express.RequestHandler {
	return async function librariesRoute(
		req: Express.Request,
		res: Express.Response
	): Promise<void> {
		res.type('html');

		const project = options.projects.get(req.params.id);

		if (!project) {
			res.sendStatus(404);
			return;
		}

		const id = Path.basename(req.path, Path.extname(req.path));
		const patternLibrary = project.getPatternLibraryById(id);

		if (typeof patternLibrary === 'undefined') {
			res.sendStatus(404);
			return;
		}

		res.type('js');
		res.send(patternLibrary.getBundle());
	};
}
