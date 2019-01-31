import * as M from '@meetalva/message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function setPane({ app }: MessageHandlerContext): MessageHandler<M.SetPane> {
	return m => app.setPane(m.payload.pane, m.payload.visible);
}
