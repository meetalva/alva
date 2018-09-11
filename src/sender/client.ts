import * as AlvaUtil from '../alva-util';
import * as Message from '../message';
import { isMessage } from './is-message';
import * as Serde from './serde';

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

	public async send(message: Message.Message): Promise<void> {
		if (!isMessage(message)) {
			console.error(`Tried to send invalid message: ${message}`);
			return;
		}

		await onReady(this.connection);
		this.connection.send(Serde.serialize(message));
	}

	public async receive(handler: (message: Message.Message) => void): Promise<void> {
		await onReady(this.connection);

		this.connection.addEventListener('message', e => {
			const message = Serde.deserialize(e.data);

			if (!message) {
				return;
			}

			handler(message);
		});
	}

	public async match<T extends Message.Message>(
		type: Message.Message['type'],
		handler: (message: T) => void
	): Promise<void> {
		await onReady(this.connection);

		this.connection.addEventListener('message', e => {
			const header = Serde.getMessageHeader(e.data);

			if (header.status === Serde.MessageHeaderStatus.Error) {
				console.error(header);
				return;
			}

			if (header.type !== type) {
				return;
			}

			const body = Serde.getMessageBody(e.data);

			if (!body) {
				return;
			}

			// tslint:disable-next-line:no-any
			const parseResult = AlvaUtil.parseJSON<any>(body);

			if (parseResult.type === AlvaUtil.ParseResultType.Error) {
				return;
			}

			if (!isMessage(parseResult.result)) {
				return;
			}

			if (parseResult.result.type !== type) {
				return;
			}

			handler(parseResult.result as T);
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
