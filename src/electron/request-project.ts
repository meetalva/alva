import * as Message from '../message';
import * as Model from '../model';
import { Sender } from '../sender/server';
import * as Types from '../types';
import * as uuid from 'uuid';

export async function requestProject(sender: Sender): Promise<Model.Project> {
	const projectResponse = await sender.request<Message.ProjectRequestResponsePair>(
		{
			id: uuid.v4(),
			type: Message.MessageType.ProjectRequest,
			payload: undefined
		},
		Message.MessageType.ProjectResponse
	);

	if (projectResponse.payload.status === Types.ProjectStatus.None) {
		throw new Error('There must be an opened project before oppening a library');
	}

	if (
		projectResponse.payload.status === Types.ProjectStatus.Error ||
		projectResponse.payload.status !== Types.ProjectStatus.Ok ||
		typeof projectResponse.payload.data === 'undefined'
	) {
		throw new Error('Error while importing library');
	}

	return Model.Project.from(projectResponse.payload.data);
}

export async function requestProjectSafely(sender: Sender): Promise<Model.Project | undefined> {
	try {
		return await requestProject(sender);
	} catch (err) {
		return;
	}
}
