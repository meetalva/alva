import * as Message from '../message';
import * as WS from 'ws';
import * as Serde from '../sender/serde';

export type ServerMessageHandler = (message: Message.Message) => void;

export interface ServerMessageHandlerContext {
	webSocketServer: WS.Server;
}

export function createServerMessageHandler(
	context: ServerMessageHandlerContext
): ServerMessageHandler {
	return function serverMessageHandler(message: Message.Message): void {
		context.webSocketServer.clients.forEach(client => {
			if (client.readyState === WS.OPEN) {
				client.send(Serde.serialize(message));
			}
		});
	};
}
