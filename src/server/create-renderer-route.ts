import * as Express from 'express';
// import * as RendererDocument from '../renderer/renderer-document';

export interface RendererRouteContext {
	hot: boolean | undefined;
	base: string | undefined;
}

export function createRendererRoute(ctx: RendererRouteContext): Express.RequestHandler {
	return async function previewRoute(req: Express.Request, res: Express.Response): Promise<void> {
		/* res.type('html');
		res.send(
			RendererDocument.rendererDocument({
				base: ctx.base,
				hot: ctx.hot
			})
		); */
	};
}
