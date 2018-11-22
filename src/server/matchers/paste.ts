import * as M from '../../message';
import * as Types from '../../types';
import * as Serde from '../../sender/serde';
import * as uuid from 'uuid';

export function paste(server: Types.AlvaServer): (message: M.Paste) => Promise<void> {
	return async m => {
		const app = await server.host.getApp();
		const sender = app || server.sender;
		const appId = m.appId || (app ? app.getId() : undefined);

		const contents = await server.host.readClipboard();

		if (!contents) {
			return;
		}

		const message = Serde.deserialize(contents);

		if (!message || message.type !== M.MessageType.Clipboard) {
			return;
		}

		const targetType = m.payload ? m.payload.targetType : Types.ElementTargetType.Auto;
		const targetId = m.payload ? m.payload.id : '';
		const itemType = deserializeItemType(message.payload.type);

		switch (itemType) {
			case Types.ItemType.Element: {
				sender.send({
					appId,
					id: uuid.v4(),
					type: M.MessageType.PasteElement,
					payload: {
						element: message.payload.item as Types.SerializedElement,
						project: message.payload.project,
						targetType,
						targetId
					}
				});
				break;
			}
			case Types.ItemType.Page:
				sender.send({
					appId,
					id: uuid.v4(),
					type: M.MessageType.PastePage,
					payload: {
						page: message.payload.item as Types.SerializedPage,
						project: message.payload.project
					}
				});
		}
	};
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
