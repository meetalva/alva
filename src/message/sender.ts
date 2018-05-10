import { ipcRenderer } from 'electron';
import { ServerMessage, ServerMessageType } from '.';

const TYPES = Object.values(ServerMessageType);

export { ServerMessage } from '.';

export function send(message: ServerMessage): void {
	ipcRenderer.send('message', message);
}

export function receive(handler: (message: ServerMessage) => void): void {
	// tslint:disable-next-line:no-any
	ipcRenderer.on('message', (e: any, message: any) => {
		const type = message.type;

		if (typeof type !== 'string' || typeof message.id !== 'string') {
			return;
		}

		if (!message.hasOwnProperty('payload')) {
			return;
		}

		if (!TYPES.includes(type)) {
			return;
		}

		handler(message);
	});
}
