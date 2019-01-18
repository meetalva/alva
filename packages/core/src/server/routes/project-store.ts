import * as Express from 'express';
import * as RendererDocument from '../../renderer/renderer-document';
import * as Types from '../../types';

export function projectStoureRouteFactory(server: Types.AlvaServer): Express.RequestHandler {
	return async function projectStoreRoute(
		req: Express.Request,
		res: Express.Response
	): Promise<void> {
		console.log('projectStoreRoute');
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

		res.send(
			RendererDocument.rendererDocument({
				payload: {
					host: server.host.type,
					view: Types.AlvaView.PageDetail,
					projectViewMode: Types.ProjectViewMode.Libraries,
					project,
					update: await server.dataHost.getUpdate()
				}
			})
		);
	};
}
