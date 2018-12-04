import * as M from '../message';
import * as T from '../types';
import * as Serde from '../sender/serde';
import * as uuid from 'uuid';

export function paste({ host }: T.MatcherContext): T.Matcher<M.Paste> {
	return async m => {
		const app = await host.getApp(m.appId || '');

		if (!app) {
			host.log(`paste: received message without resolveable app: ${m}`);
			return;
		}

		const contents = await host.readClipboard();

		if (!contents) {
			host.log(`paste: non contents`);
			return;
		}

		const message = Serde.deserialize(contents);

		if (!message || message.type !== M.MessageType.Clipboard) {
			host.log(`paste: clipboard message is no message`);
			return;
		}

		const targetType = m.payload ? m.payload.targetType : T.ElementTargetType.Auto;
		const targetId = m.payload ? m.payload.id : '';
		const itemType = deserializeItemType(message.payload.type);

		switch (itemType) {
			case T.ItemType.Element: {
				app.send({
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
			case T.ItemType.Page: {
				app.send({
					id: uuid.v4(),
					type: M.MessageType.PastePage,
					payload: {
						page: message.payload.item as T.SerializedPage,
						project: message.payload.project
					}
				});
				break;
			}
			default:
				host.log(`paste: unknown item type ${itemType}`);
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
