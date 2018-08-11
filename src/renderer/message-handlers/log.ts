import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function log(_: MessageHandlerContext): MessageHandler<M.Log> {
	return m => {
		if (Array.isArray(m.payload)) {
			console.log(...m.payload);
		} else {
			console.log(m.payload);
		}
	};
}
