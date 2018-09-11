import * as Message from '../message';
import * as Model from '../model';
import { Sender } from '../sender/server';
import * as uuid from 'uuid';

export async function requestApp(sender: Sender): Promise<Model.AlvaApp> {
	const appResponse = await sender.request<Message.AppRequestResponsePair>(
		{
			id: uuid.v4(),
			type: Message.MessageType.AppRequest,
			payload: undefined
		},
		Message.MessageType.AppResponse
	);

	return Model.AlvaApp.from(appResponse.payload.app);
}

export async function requestAppSafely(sender: Sender): Promise<Model.AlvaApp | undefined> {
	try {
		return await requestApp(sender);
	} catch (err) {
		return;
	}
}
