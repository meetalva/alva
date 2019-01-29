import * as M from '@meetalva/message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function undo({ app, store }: MessageHandlerContext): MessageHandler<M.Undo> {
	return () => {
		if (app.getHasFocusedInput()) {
			return;
		}

		store.undo();
	};
}
