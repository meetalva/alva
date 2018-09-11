import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function redo({ app, store }: MessageHandlerContext): MessageHandler<M.Redo> {
	return () => {
		if (app.getHasFocusedInput()) {
			return;
		}

		store.redo();
	};
}
