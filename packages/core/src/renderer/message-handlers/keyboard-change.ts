import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function keyboardChange({ store }: MessageHandlerContext): MessageHandler<M.KeyboardChange> {
	return m => {
		store.setMetaDown(m.payload.metaDown);
	};
}
