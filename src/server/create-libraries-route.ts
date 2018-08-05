import * as Express from 'express';
import { Sender } from '../sender/server';
import * as Model from '../model';
import * as Path from 'path';

export interface LibrariesRouteOptions {
	sender: Sender | undefined;
	project: Model.Project | undefined;
}

export function createLibrariesRoute(options: LibrariesRouteOptions): Express.RequestHandler {
	return async function librariesRoute(
		req: Express.Request,
		res: Express.Response
	): Promise<void> {
		if (!options.project) {
			res.send(404);
			return;
		}

		const id = Path.basename(req.path, Path.extname(req.path));
		const patternLibrary = options.project.getPatternLibraryById(id);

		if (typeof patternLibrary === 'undefined') {
			res.sendStatus(404);
			return;
		}

		res.type('js');
		res.send(patternLibrary.getBundle());
	};
}
