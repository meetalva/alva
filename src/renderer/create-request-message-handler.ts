import * as Message from '../message';
import * as Model from '../model';
import * as Sender from '../sender/client';
import { ViewStore } from '../store';
import * as Types from '../types';

export type RequestMessageHandler = (message: Message.ServerMessage) => void;

export function createRequestMessageHandler({
	app,
	history,
	store
}: {
	app: Model.AlvaApp;
	history: Model.EditHistory;
	store: ViewStore;
}): RequestMessageHandler {
	return function requestMessageHandler(message: Message.ServerMessage): void {
		switch (message.type) {
			case Message.ServerMessageType.ProjectRequest: {
				const data = store.getProject();

				if (!data) {
					return Sender.send({
						id: message.id,
						type: Message.ServerMessageType.ProjectResponse,
						payload: {
							data: undefined,
							status: Types.ProjectStatus.None
						}
					});
				}

				return Sender.send({
					id: message.id,
					type: Message.ServerMessageType.ProjectResponse,
					payload: {
						data: data.toJSON(),
						status: Types.ProjectStatus.Ok
					}
				});
			}
		}
	};
}
