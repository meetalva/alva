import * as Express from 'express';
import * as PreviewDocument from '../../preview-document';
import * as Types from '../../types';

export function previewRouteFactory(server: Types.AlvaServer): Express.RequestHandler {
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

		const userLibraries = project
			.getPatternLibraries()
			.filter(lib => lib.getOrigin() === Types.PatternLibraryOrigin.UserProvided);

		const script = lib =>
			`<script src="/project/${project.getId()}/library/${lib.getId()}" data-bundle="${lib.getBundleId()}"></script>`;

		res.send(
			PreviewDocument.previewDocument({
				data: project.toJSON(),
				scripts: userLibraries.map(script)
			})
		);
	};
}
