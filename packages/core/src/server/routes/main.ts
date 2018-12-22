import * as Express from 'express';
import * as RendererDocument from '../../renderer/renderer-document';
import * as Types from '../../types';

export function mainRouteFactory(server: Types.AlvaServer): Express.RequestHandler {
	return async function mainRoute(req: Express.Request, res: Express.Response): Promise<void> {
		res.type('html');
		res.send(
			RendererDocument.rendererDocument({
				payload: {
					host: server.host.type,
					view: Types.AlvaView.SplashScreen
				}
			})
		);
	};
}
