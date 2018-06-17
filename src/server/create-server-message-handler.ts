import * as Message from '../message';
import * as WS from 'ws';

export type ServerMessageHandler = (message: Message.ServerMessage) => void;

export interface ServerMessageHandlerContext {
	webSocketServer: WS.Server;
}

export function createServerMessageHandler(
	context: ServerMessageHandlerContext
): ServerMessageHandler {
	return function serverMessageHandler(message: Message.ServerMessage): void {
		context.webSocketServer.clients.forEach(client => {
			if (client.readyState === WS.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	};
}
