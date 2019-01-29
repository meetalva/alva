import * as Express from 'express';
import * as PreviewDocument from '../../preview-document';
import * as Types from '@meetalva/types';
import { PatternLibrary } from '../../model';
import { ServerContext } from './context';

export function previewRouteFactory(server: ServerContext): Express.RequestHandler {
	return async function previewRoute(req: Express.Request, res: Express.Response): Promise<void> {
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

		const userLibraries = project.getPatternLibraries();

		const script = (lib: PatternLibrary) =>
			`<script src="/project/${project.getId()}/library/${lib.getId()}" data-bundle="${lib.getBundleId()}"></script>`;

		res.send(
			PreviewDocument.previewDocument({
				data: project.toJSON(),
				transferType: Types.PreviewTransferType.Inline,
				scripts: userLibraries.map(script)
			})
		);
	};
}
