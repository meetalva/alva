import * as Express from 'express';
import { ProjectRequestResponsePair, ServerMessageType } from '../message';
import { Sender } from '../sender/server';
import * as Model from '../model';
import * as Path from 'path';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface LibrariesRouteOptions {
	sender: Sender;
}

export function createLibrariesRoute(options: LibrariesRouteOptions): Express.RequestHandler {
	return async function librariesRoute(
		req: Express.Request,
		res: Express.Response
	): Promise<void> {
		const projectResponse = await options.sender.request<ProjectRequestResponsePair>(
			{
				id: uuid.v4(),
				type: ServerMessageType.ProjectRequest,
				payload: undefined
			},
			ServerMessageType.ProjectResponse
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

		const id = Path.basename(req.path, Path.extname(req.path));
		const project = Model.Project.from(projectResponse.payload.data);
		const patternLibrary = project.getPatternLibraryById(id);

		if (typeof patternLibrary === 'undefined') {
			res.sendStatus(404);
			return;
		}

		res.type('js');
		res.send(patternLibrary.getBundle());
	};
}
