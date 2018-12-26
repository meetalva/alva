import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function appRequest({ app }: MessageHandlerContext): MessageHandler<M.AppRequest> {
	return m => {
		app.send({
			id: m.id,
			type: M.MessageType.AppResponse,
			transaction: m.transaction,
			payload: {
				app: app.toJSON()
			}
		});
	};
}
