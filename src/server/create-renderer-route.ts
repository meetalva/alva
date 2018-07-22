import * as Express from 'express';
import { Sender } from '../sender/server';
import * as RendererDocument from '../renderer/renderer-document';

export interface RendererRouteOptions {
	sender: Sender;
}

export function createRendererRoute(options: RendererRouteOptions): Express.RequestHandler {
	return async function previewRoute(req: Express.Request, res: Express.Response): Promise<void> {
		res.type('html');

		res.send(RendererDocument.rendererDocument());
	};
}
