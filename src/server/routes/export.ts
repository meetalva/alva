import * as Express from 'express';
import * as PreviewDocument from '../../preview-document';
import * as Types from '../../types';
import * as Path from 'path';

export function exportRouteFactory(server: Types.AlvaServer): Express.RequestHandler {
	return async function exportRoute(req: Express.Request, res: Express.Response): Promise<void> {
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

		const firstPage = project.getPages()[0];
		const id = Path.basename(req.path, Path.extname(req.path));

		if (!id && !firstPage) {
			res.sendStatus(404);
			return;
		}

		project.getPages().forEach(p => p.setActive(false));
		firstPage.setActive(true);

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
