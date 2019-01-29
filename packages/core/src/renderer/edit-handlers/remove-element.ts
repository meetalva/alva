import * as M from '@meetalva/message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function removeElement({
	app,
	store
}: MessageHandlerContext): MessageHandler<M.CutElement | M.DeleteElement> {
	return m => {
		if (app.getHasFocusedInput()) {
			return;
		}

		store.removeElementById(m.payload);
	};
}
