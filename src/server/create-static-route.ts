import * as Express from 'express';
import * as Path from 'path';
import * as PreviewDocument from '../preview-document';
import { ProjectRequestResponsePair, MessageType } from '../message';
import { Sender } from '../sender/server';
import * as Model from '../model';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface StaticRouteOptions {
	sender: Sender;
}

export function createStaticRoute(options: StaticRouteOptions): Express.RequestHandler {
	return async function staticRoute(req: Express.Request, res: Express.Response): Promise<void> {
		res.type('html');

		const projectResponse = await options.sender.request<ProjectRequestResponsePair>(
			{
				id: uuid.v4(),
				type: MessageType.ProjectRequest,
				payload: undefined
			},
			MessageType.ProjectResponse
		);

		if (projectResponse.payload.status === Types.ProjectStatus.None) {
			res.sendStatus(404);
			return;
		}

		if (projectResponse.payload.status === Types.ProjectStatus.Error) {
			res.sendStatus(500);
			return;
		}

		if (
			projectResponse.payload.status !== Types.ProjectStatus.Ok ||
			typeof projectResponse.payload.data === 'undefined'
		) {
			res.sendStatus(500);
			return;
		}

		const project = Model.Project.from(projectResponse.payload.data);
		const firstPage = project.getPages()[0];

		const id = Path.basename(req.path, Path.extname(req.path));

		if (!id && !firstPage) {
			res.sendStatus(404);
			return;
		}

		if (!id && firstPage) {
			res.redirect(`${firstPage.getId()}.html`);
			return;
		}

		const page = project.getPageById(id);

		if (!page) {
			res.sendStatus(404);
			return;
		}

		project.getPages().forEach(p => p.setActive(false));
		page.setActive(true);

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
