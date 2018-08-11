import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function appRequest({ store, app }: MessageHandlerContext): MessageHandler<M.AppRequest> {
	return m => {
		store.getSender().send({
			id: m.id,
			type: M.MessageType.AppResponse,
			payload: {
				app: app.toJSON()
			}
		});
	};
}
