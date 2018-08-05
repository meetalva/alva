import * as Express from 'express';
import * as RendererDocument from '../renderer/renderer-document';

export function createRendererRoute(): Express.RequestHandler {
	return async function previewRoute(req: Express.Request, res: Express.Response): Promise<void> {
		res.type('html');
		res.send(RendererDocument.rendererDocument());
	};
}
