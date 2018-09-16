import { ipcMain } from 'electron';
import { isMessage } from './is-message';
import * as uuid from 'uuid';
import * as Message from '../message';

export type ServerHandler = (message: Message.Message) => void;

// tslint:disable-next-line:no-any
export type IpcHandler = (e: any, message: any) => void;

export class Sender {
	private received: Map<Message.MessageType, Message.Message> = new Map();

	// tslint:disable-next-line:no-any
	private receiveIpcHandlers: IpcHandler[] = [];

	public async receive(handler: (message: Message.Message) => void): Promise<void> {
		// tslint:disable-next-line:no-any
		const receiveHandler = (e: any, message: any) => {
			if (!isMessage(message)) {
				return;
			}
			this.received.set(message.type, message);
			handler(message);
		};

		ipcMain.on('message', receiveHandler);
		this.receiveIpcHandlers.push(receiveHandler);
	}

	public transaction<T extends Message.Message>(
		message: Message.Message,
		{ type }: { type: T['type'] }
	): Promise<T> {
		return new Promise<T>(resolve => {
			const transaction = uuid.v4();
			let done = false;

			this.match(type, msg => {
				if (!isMessage(msg) || done) {
					return;
				}

				if (transaction !== msg.transaction) {
					return;
				}

				done = true;
				resolve(msg as T);
			});

			this.send({
				...message,
				transaction
			});
		});
	}

	public request<T extends Message.RequestResponsePair>(
		message: T['request'],
		responseType: T['response']['type']
	): Promise<T['response']> {
		return new Promise((resolve, reject) => {
			// tslint:disable-next-line:no-any
			function messageHandler(e: any, responseMessage: any): void {
				if (!isMessage(message)) {
					return;
				}

				if (responseMessage.id !== message.id) {
					return;
				}

				if (responseType !== responseMessage.type) {
					return;
				}

				ipcMain.removeListener('message', messageHandler);
				resolve(responseMessage);
			}

			ipcMain.on('message', messageHandler);
			this.send(message);
		});
	}

	public async send(message: Message.Message): Promise<void> {
		if (!isMessage(message)) {
			console.warn(`Server tried to send invalid message: ${JSON.stringify(message)}`);
			return;
		}

		ipcMain.emit('message', undefined, message);
	}

	public stop(): void {
		this.received.clear();
		this.receiveIpcHandlers.forEach(receiveIpcHandler => {
			ipcMain.removeListener('message', receiveIpcHandler);
		});
	}

	public last<T extends Message.Message>(type: T['type']): T | undefined {
		return this.received.get(type) as T;
	}

	// tslint:disable-next-line:no-any
	public async log(...args: any[]): Promise<void> {
		this.send({
			type: Message.MessageType.Log,
			id: uuid.v4(),
			payload: args
		});
	}

	public async match<T extends Message.Message>(
		type: Message.Message['type'],
		handler: (message: T) => void
	): Promise<void> {
		this.receive(message => {
			if (message.type === type) {
				handler(message as T);
			}
		});
	}
}
