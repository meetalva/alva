import { ipcRenderer } from 'electron';
import { isMessage } from './is-message';
import { ServerMessage } from '.';

export { ServerMessage } from '.';
export * from './is-message';

export function send(message: ServerMessage): void {
	if (!isMessage(message)) {
		console.warn(`Client tried to send invalid message: ${JSON.stringify(message)}`);
		return;
	}
	ipcRenderer.send('message', message);
}

export function receive(handler: (message: ServerMessage) => void): void {
	// tslint:disable-next-line:no-any
	ipcRenderer.on('message', (e: any, message: any) => {
		if (!isMessage(message)) {
			return;
		}
		handler(message);
	});
}
