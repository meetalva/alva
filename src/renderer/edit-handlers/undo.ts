import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function undo({ app, store }: MessageHandlerContext): MessageHandler<M.Undo> {
	return m => {
		if (app.getHasFocusedInput()) {
			return;
		}

		store.undo();
	};
}
