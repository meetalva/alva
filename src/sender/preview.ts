import * as AlvaUtil from '../alva-util';
import * as Message from '../message';
import { isServerMessage } from './is-server-message';
import { isPreviewMessage } from './is-preview-message';

export interface SenderInit {
	endpoint: string;
}

export class Sender {
	private endpoint: string;
	private connection: WebSocket;

	public constructor(init: SenderInit) {
		this.endpoint = init.endpoint;
		this.connection = new WebSocket(this.endpoint);
	}

	public async send(message: Message.PreviewMessage): Promise<void> {
		if (!isPreviewMessage) {
			return;
		}

		await onReady(this.connection);

		this.connection.send(JSON.stringify(message));
	}

	// tslint:disable-next-line:no-any
	public async receive(handler: (message: Message.ServerMessage) => void): Promise<void> {
		await onReady(this.connection);

		this.connection.addEventListener('message', e => {
			// tslint:disable-next-line:no-any
			const parseResult = AlvaUtil.parseJSON<any>(e.data);

			if (parseResult.type === AlvaUtil.ParseResultType.Error) {
				return;
			}

			if (!isServerMessage(parseResult.result)) {
				return;
			}

			handler(parseResult.result);
		});
	}
}

function onReady(connection: WebSocket): Promise<void> {
	return new Promise((resolve, reject) => {
		switch (connection.readyState) {
			case WebSocket.CONNECTING:
				return connection.addEventListener('open', () => resolve(undefined));
			case WebSocket.OPEN:
				return resolve(undefined);
		}
	});
}
