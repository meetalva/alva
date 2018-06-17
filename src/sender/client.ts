import * as Electron from 'electron';
import { isServerMessage } from './is-server-message';
import * as Message from '../message';

export function send(message: Message.ServerMessage): void {
	if (!isServerMessage(message)) {
		console.warn(`Client tried to send invalid message: ${JSON.stringify(message)}`);
		return;
	}
	Electron.ipcRenderer.emit('message', undefined, message);
	Electron.ipcRenderer.send('message', message);
}

export function receive(handler: (message: Message.ServerMessage) => void): void {
	Electron.ipcRenderer.on('message', (e: Electron.Event, message) => {
		if (!isServerMessage(message)) {
			return;
		}
		handler(message);
	});
}
