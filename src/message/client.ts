import * as Electron from 'electron';
import { isMessage } from './is-message';
import { ServerMessage } from '.';

export { ServerMessage } from '.';
export * from './is-message';

export function send(message: ServerMessage): void {
	if (!isMessage(message)) {
		console.warn(`Client tried to send invalid message: ${JSON.stringify(message)}`);
		return;
	}
	Electron.ipcRenderer.send('message', message);
}

export function receive(handler: (message: ServerMessage) => void): void {
	Electron.ipcRenderer.on('message', (e: Electron.Event, message) => {
		if (!isMessage(message)) {
			return;
		}
		handler(message);
	});
}
