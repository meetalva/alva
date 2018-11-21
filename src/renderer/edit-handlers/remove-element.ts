import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function removeElement({
	app,
	store
}: MessageHandlerContext): MessageHandler<M.CutElement | M.DeleteElement> {
	return m => {
		if (app.getHasFocusedInput()) {
			return;
		}

		const senders = m.sender || [];

		if (!senders.includes(store.getSender().id)) {
			return;
		}

		store.removeElementById(m.payload);
	};
}
