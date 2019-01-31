import * as M from '@meetalva/message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function updateDownloaded({
	store
}: MessageHandlerContext): MessageHandler<M.UpdateDownloaded> {
	return m => {
		store.getApp().setUpdate(m.payload);
	};
}
