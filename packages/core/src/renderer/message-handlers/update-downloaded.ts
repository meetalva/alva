import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function updateDownloaded({
	store
}: MessageHandlerContext): MessageHandler<M.UpdateDownloaded> {
	return m => store.getApp().addNotification(m.payload);
}
