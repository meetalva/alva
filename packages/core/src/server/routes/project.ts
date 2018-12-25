import * as Express from 'express';
import * as RendererDocument from '../../renderer/renderer-document';
import * as Types from '../../types';

export function projectRouteFactory(server: Types.AlvaServer): Express.RequestHandler {
	return async function projectRoute(req: Express.Request, res: Express.Response): Promise<void> {
		res.type('html');

		if (typeof req.params.id !== 'string') {
			res.sendStatus(404);
			return;
		}

		const project = await server.dataHost.getProject(req.params.id);

		if (!project) {
			res.sendStatus(404);
			return;
		}

		// TODO: Formalize this better - this means
		// we want to sync a project if it is actually used
		// in an edit interface
		project.sync(server.sender);

		res.send(
			RendererDocument.rendererDocument({
				payload: {
					host: server.host.type,
					view: Types.AlvaView.PageDetail,
					project,
					update: await server.dataHost.getUpdate()
				}
			})
		);
	};
}
