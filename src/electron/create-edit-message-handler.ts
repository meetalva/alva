import * as Clipboard from './clipboard';
import * as Message from '../message';
import { requestProject } from './request-project';
import * as Types from '../types';
import * as uuid from 'uuid';

import {
	ServerMessageHandlerContext,
	ServerMessageHandlerInjection
} from './create-server-message-handler';

export async function createEditMessageHandler(
	ctx: ServerMessageHandlerContext,
	injection: ServerMessageHandlerInjection
): Promise<(message: Message.Message) => Promise<void>> {
	return async function editMessageHandler(message: Message.Message): Promise<void> {
		switch (message.type) {
			case Message.MessageType.Cut:
			case Message.MessageType.Copy: {
				const project = await requestProject(injection.sender);
				const focusedItemType = project.getFocusedItemType();
				const focusedItem = project.getFocusedItem();

				if (!focusedItem || focusedItemType === Types.ItemType.None) {
					return;
				}

				Clipboard.setClipboard({
					type: serializeItemType(focusedItemType),
					item: focusedItem.toJSON(),
					project: project.toJSON()
				});

				break;
			}
			case Message.MessageType.CutElement:
			case Message.MessageType.CopyElement: {
				const project = await requestProject(injection.sender);
				const element = project.getElementById(message.payload);

				if (!element) {
					return;
				}

				Clipboard.setClipboard({
					type: serializeItemType(Types.ItemType.Element),
					item: element.toJSON(),
					project: project.toJSON()
				});

				break;
			}
			case Message.MessageType.Paste: {
				const clipboard = Clipboard.getClipboard();

				if (!clipboard) {
					return;
				}

				const itemType = deserializeItemType(clipboard.payload.type);
				const targetType = message.payload
					? message.payload.targetType
					: Types.ElementTargetType.Auto;
				const targetId = message.payload ? message.payload.id : '';

				switch (itemType) {
					case Types.ItemType.Element:
						injection.sender.send({
							id: uuid.v4(),
							type: Message.MessageType.PasteElement,
							payload: {
								element: clipboard.payload.item as Types.SerializedElement,
								project: clipboard.payload.project,
								targetType,
								targetId
							}
						});
						break;
					case Types.ItemType.Page:
						injection.sender.send({
							id: uuid.v4(),
							type: Message.MessageType.PastePage,
							payload: {
								page: clipboard.payload.item as Types.SerializedPage,
								project: clipboard.payload.project
							}
						});
				}
			}
		}
	};
}

function serializeItemType(type: Types.ItemType): Types.SerializedItemType {
	switch (type) {
		case Types.ItemType.Element:
			return 'element';
		case Types.ItemType.Page:
			return 'page';
		case Types.ItemType.None:
			return 'none';
	}
}

function deserializeItemType(type: Types.SerializedItemType): Types.ItemType {
	switch (type) {
		case 'element':
			return Types.ItemType.Element;
		case 'page':
			return Types.ItemType.Page;
		case 'none':
			return Types.ItemType.None;
	}
}
