import { BrowserWindow, ipcMain } from 'electron';
import { isMessage } from './is-message';
import { ServerMessage } from '.';

export { ServerMessage } from '.';
export * from './is-message';

export function send(message: ServerMessage): void {
	if (!isMessage(message)) {
		console.warn(`Server tried to send invalid message: ${JSON.stringify(message)}`);
		return;
	}

	BrowserWindow.getAllWindows().forEach(win => win.webContents.send('message', message));
}

export function receive(handler: (message: ServerMessage) => void): void {
	// tslint:disable-next-line:no-any
	ipcMain.on('message', (e: any, message: any) => {
		if (!isMessage(message)) {
			return;
		}
		handler(message);
	});
}
