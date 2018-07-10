import * as Express from 'express';
import * as PreviewDocument from '../preview-document';
import { ProjectRequestResponsePair, MessageType } from '../message';
import { Sender } from '../sender/server';
import * as Model from '../model';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface PreviewRouteOptions {
	sender: Sender;
}

export function createPreviewRoute(options: PreviewRouteOptions): Express.RequestHandler {
	return async function previewRoute(req: Express.Request, res: Express.Response): Promise<void> {
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

		res.send(
			PreviewDocument.previewDocument({
				data: projectResponse.payload.data,
				scripts: project
					.getPatternLibraries()
					.map(
						lib =>
							`<script src="/libraries/${lib.getId()}.js" data-bundle="${lib.getBundleId()}"></script>`
					)
			})
		);
	};
}
