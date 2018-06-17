import { BrowserWindow, ipcMain } from 'electron';
import { isServerMessage } from './is-server-message';
import * as uuid from 'uuid';
import * as Message from '../message';

export type ServerHandler = (message: Message.ServerMessage) => void;

// tslint:disable-next-line:no-any
export type IpcHandler = (e: any, message: any) => void;

export class Sender {
	private received: Map<Message.ServerMessageType, Message.ServerMessage> = new Map();
	private sendHandlers: ServerHandler[] = [];

	// tslint:disable-next-line:no-any
	private receiveIpcHandlers: IpcHandler[] = [];

	public async receive(handler: (message: Message.ServerMessage) => void): Promise<void> {
		// tslint:disable-next-line:no-any
		const receiveHandler = (e: any, message: any) => {
			if (!isServerMessage(message)) {
				return;
			}
			this.received.set(message.type, message);
			handler(message);
		};

		ipcMain.on('message', receiveHandler);
		this.receiveIpcHandlers.push(receiveHandler);
	}

	public request<T extends Message.RequestResponsePair>(
		message: T['request'],
		responseType: T['response']['type']
	): Promise<T['response']> {
		return new Promise((resolve, reject) => {
			// tslint:disable-next-line:no-any
			function messageHandler(e: any, responseMessage: any): void {
				if (!isServerMessage(message)) {
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

	public async send(message: Message.ServerMessage): Promise<void> {
		if (!isServerMessage(message)) {
			console.warn(`Server tried to send invalid message: ${JSON.stringify(message)}`);
			return;
		}

		this.sendHandlers.forEach(handler => handler(message));
		ipcMain.emit('message', undefined, message);
		BrowserWindow.getAllWindows().forEach(win => win.webContents.send('message', message));
	}

	public stop(): void {
		this.received.clear();
		this.sendHandlers = [];
		this.receiveIpcHandlers.forEach(receiveIpcHandler => {
			ipcMain.removeListener('message', receiveIpcHandler);
		});
	}

	public use(handler: ServerHandler): void {
		this.sendHandlers.push(handler);
	}

	public last(type: Message.ServerMessageType): Message.ServerMessage | undefined {
		return this.received.get(type);
	}

	// tslint:disable-next-line:no-any
	public async log(...args: any[]): Promise<void> {
		this.send({
			type: Message.ServerMessageType.Log,
			id: uuid.v4(),
			payload: args
		});
	}
}
