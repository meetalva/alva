import * as AlvaUtil from '../alva-util';
import * as Events from 'events';

import { createClientConnectHandler } from './create-client-connect-handler';

export type ConnectionHandler = (ws: WebSocket) => void;

export interface ConnectionHandlerContext {
	emitter: Events.EventEmitter;
}

export function createConnectionHandler(context: ConnectionHandlerContext): ConnectionHandler {
	const onClientConnect = createClientConnectHandler();

	return function connectionHandler(ws: WebSocket): void {
		// tslint:disable-next-line:no-any
		const w = ws as any;

		w.on('error', err => {
			console.error(err);
		});

		w.on('message', envelope => {
			if (typeof envelope === 'undefined') {
				return;
			}

			const parseResult = AlvaUtil.parseJSON(String(envelope));

			if (parseResult.type === AlvaUtil.ParseResultType.Error) {
				return;
			}

			context.emitter.emit('client-message', parseResult.result);
		});

		onClientConnect(ws);
	};
}
