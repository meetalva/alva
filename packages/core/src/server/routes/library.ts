import * as Express from 'express';
import * as Types from '../../types';

export function libraryRouteFactory(server: Types.AlvaServer): Express.RequestHandler {
	return async function libraryRoute(req: Express.Request, res: Express.Response): Promise<void> {
		if (typeof req.params.projectId !== 'string' || typeof req.params.libraryId !== 'string') {
			res.sendStatus(404);
			return;
		}

		const project = await server.dataHost.getProject(req.params.projectId);

		if (!project) {
			res.sendStatus(404);
			return;
		}

		const library = project.getPatternLibraryById(req.params.libraryId);

		if (!library) {
			res.sendStatus(404);
			return;
		}

		res.type('js');
		res.send(library.getBundle());
	};
}
