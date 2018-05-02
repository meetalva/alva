import { checkForUpdates } from './auto-updater';
import { colors } from '../lsg/patterns/colors';
import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as Fs from 'fs';
import * as getPort from 'get-port';
import * as stringEscape from 'js-string-escape';
import { PreviewMessageType, ServerMessage, ServerMessageType } from '../message';
import * as Path from 'path';
import { createServer } from './server';
import * as Url from 'url';
import * as uuid from 'uuid';

const APP_ENTRY = require.resolve('./renderer');

const RENDERER_DOCUMENT = `<!doctype html>
<html>
<body>
	<div id="app"></div>
	<script>require('${stringEscape(APP_ENTRY)}')</script>
</body>
</html>`;

Fs.writeFileSync(Path.join(__dirname, 'app.html'), RENDERER_DOCUMENT);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | undefined;

async function createWindow(): Promise<void> {
	const { width = 1280, height = 800 } = screen.getPrimaryDisplay().workAreaSize;

	// Create the browser window.
	win = new BrowserWindow({
		width,
		height,
		minWidth: 780,
		minHeight: 380,
		titleBarStyle: 'hiddenInset',
		backgroundColor: colors.grey97.toString('hex'),
		title: 'Alva'
	});

	// and load the index.html of the app.
	win.loadURL(
		Url.format({
			pathname: Path.join(__dirname, 'app.html'),
			protocol: 'file:',
			slashes: true
		})
	);

	// Cast getPort return type from PromiseLike<number> to Promise<number>
	// to avoid async-promise tslint rule to produce errors here
	const port = await (getPort({ port: 1879 }) as Promise<number>);
	const server = await createServer({ port });

	// tslint:disable-next-line:no-any
	const send = (message: ServerMessage) => {
		if (win) {
			win.webContents.send('message', message);
		}
	};

	// tslint:disable-next-line:no-any
	ipcMain.on('message', (e: Electron.Event, payload: any) => {
		if (!payload) {
			return;
		}

		server.emit('message', payload);

		switch (payload.type) {
			case ServerMessageType.AppLoaded: {
				send({
					id: uuid.v4(),
					type: ServerMessageType.StartApp,
					payload: String(port)
				});
			}
		}
	});

	server.on('client-message', (envelope: string) => {
		try {
			const message = JSON.parse(envelope);

			switch (message.type) {
				case PreviewMessageType.ContentResponse: {
					send({
						id: message.id,
						payload: message.payload,
						type: ServerMessageType.ContentResponse
					});
					break;
				}

				case PreviewMessageType.SketchExportResponse: {
					send({
						id: message.id,
						payload: message.payload,
						type: ServerMessageType.SketchExportResponse
					});
					break;
				}

				case PreviewMessageType.OpenPage: {
					send({
						id: message.id,
						payload: message.payload,
						type: ServerMessageType.OpenPage
					});
					break;
				}

				case PreviewMessageType.SetVariable: {
					send({
						id: message.id,
						payload: message.payload,
						type: ServerMessageType.SetVariable
					});
				}
			}
		} catch (err) {
			console.error('Error while receiving client message');
			console.error(err);
		}
	});

	// Open the DevTools.
	// win.webContents.openDevTools();

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = undefined;
	});

	// Disable navigation on the host window object, triggered by system drag and drop
	win.webContents.on('will-navigate', e => {
		e.preventDefault();
	});

	let devToolsInstaller;
	try {
		devToolsInstaller = require('electron-devtools-installer');
	} catch (error) {
		// Ignored
	}

	if (devToolsInstaller) {
		devToolsInstaller
			.default(devToolsInstaller.REACT_DEVELOPER_TOOLS)
			// tslint:disable-next-line:no-any
			.catch((err: any) => {
				console.warn('An error occurred: ', err);
			});
	}
	checkForUpdates(win);
}

const log = require('electron-log');
log.info('App starting...');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
	await createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', async () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (!win) {
		await createWindow();
	}
});

ipcMain.on('request-check-for-updates', () => {
	if (win) {
		checkForUpdates(win, true);
	}
});
