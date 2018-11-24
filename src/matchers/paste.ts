import * as M from '../message';
import * as T from '../types';
import * as Serde from '../sender/serde';
import * as uuid from 'uuid';

export function paste({ host }: T.MatcherContext): T.Matcher<M.Paste> {
	return async m => {
		const app = await host.getApp();
		const sender = app || (await host.getSender());
		const appId = m.appId || (app ? app.getId() : undefined);

		const contents = await host.readClipboard();

		if (!contents) {
			return;
		}

		const message = Serde.deserialize(contents);

		if (!message || message.type !== M.MessageType.Clipboard) {
			return;
		}

		const targetType = m.payload ? m.payload.targetType : T.ElementTargetType.Auto;
		const targetId = m.payload ? m.payload.id : '';
		const itemType = deserializeItemType(message.payload.type);

		switch (itemType) {
			case T.ItemType.Element: {
				sender.send({
					appId,
					id: uuid.v4(),
					type: M.MessageType.PasteElement,
					payload: {
						element: message.payload.item as T.SerializedElement,
						project: message.payload.project,
						targetType,
						targetId
					}
				});
				break;
			}
			case T.ItemType.Page:
				sender.send({
					appId,
					id: uuid.v4(),
					type: M.MessageType.PastePage,
					payload: {
						page: message.payload.item as T.SerializedPage,
						project: message.payload.project
					}
				});
		}
	};
}

function deserializeItemType(type: T.SerializedItemType): T.ItemType {
	switch (type) {
		case 'element':
			return T.ItemType.Element;
		case 'page':
			return T.ItemType.Page;
		case 'none':
			return T.ItemType.None;
	}
}
