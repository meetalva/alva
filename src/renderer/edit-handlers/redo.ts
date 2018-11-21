import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function redo({ app, store }: MessageHandlerContext): MessageHandler<M.Redo> {
	return m => {
		if (app.getHasFocusedInput()) {
			return;
		}

		const senders = m.sender || [];

		if (!senders.includes(store.getSender().id)) {
			return;
		}

		store.redo();
	};
}
