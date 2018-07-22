import * as Message from '../message';
import * as Model from '../model';
import { ViewStore } from '../store';
import * as Types from '../types';

export type RequestMessageHandler = (message: Message.Message) => void;

export function createRequestMessageHandler({
	app,
	history,
	store
}: {
	app: Model.AlvaApp;
	history: Model.EditHistory;
	store: ViewStore;
}): RequestMessageHandler {
	const sender = store.getSender();

	return function requestMessageHandler(message: Message.Message): void {
		switch (message.type) {
			case Message.MessageType.ProjectRequest: {
				const data = store.getProject();

				if (!data) {
					sender.send({
						id: message.id,
						type: Message.MessageType.ProjectResponse,
						payload: {
							data: undefined,
							status: Types.ProjectStatus.None
						}
					});

					return;
				}

				sender.send({
					id: message.id,
					type: Message.MessageType.ProjectResponse,
					payload: {
						data: data.toJSON(),
						status: Types.ProjectStatus.Ok
					}
				});

				return;
			}
			case Message.MessageType.AppRequest: {
				sender.send({
					id: message.id,
					type: Message.MessageType.AppResponse,
					payload: {
						app: app.toJSON()
					}
				});
			}
		}
	};
}
