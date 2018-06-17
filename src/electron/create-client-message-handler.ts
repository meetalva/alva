import * as Message from '../message';
import { Sender } from '../sender/server';

export type ClientMessageHandler = (message: Message.PreviewMessage) => Promise<void>;

export interface ClientMessageInjection {
	sender: Sender;
}

export const createClientMessageHandler = async ({
	sender
}: ClientMessageInjection): Promise<ClientMessageHandler> =>
	async function clientMessageHandler(message: Message.PreviewMessage): Promise<void> {
		switch (message.type) {
			case Message.PreviewMessageType.ActivatePage: {
				return sender.send({
					id: message.id,
					payload: message.payload,
					type: Message.ServerMessageType.ActivatePage
				});
			}
			case Message.PreviewMessageType.ContentResponse: {
				return sender.send({
					id: message.id,
					payload: message.payload,
					type: Message.ServerMessageType.ContentResponse
				});
			}
			case Message.PreviewMessageType.SketchExportResponse: {
				return sender.send({
					id: message.id,
					payload: message.payload,
					type: Message.ServerMessageType.SketchExportResponse
				});
			}
			case Message.PreviewMessageType.SelectElement: {
				return sender.send({
					id: message.id,
					payload: message.payload,
					type: Message.ServerMessageType.SelectElement
				});
			}
			case Message.PreviewMessageType.UnselectElement: {
				return sender.send({
					id: message.id,
					payload: undefined,
					type: Message.ServerMessageType.UnselectElement
				});
			}
			case Message.PreviewMessageType.HighlightElement: {
				return sender.send({
					id: message.id,
					payload: message.payload,
					type: Message.ServerMessageType.HighlightElement
				});
			}
			case Message.PreviewMessageType.UnHighlightElement: {
				return sender.send({
					id: message.id,
					payload: message.payload,
					type: Message.ServerMessageType.UnHighlightElement
				});
			}
			case Message.PreviewMessageType.KeyboardChange: {
				return sender.send({
					id: message.id,
					payload: message.payload,
					type: Message.ServerMessageType.KeyboardChange
				});
			}
			default: {
				return;
			}
		}
	};
