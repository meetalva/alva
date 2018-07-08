import { startUpdater, stopUpdater } from './auto-updater';
import { createServerMessageHandler } from './create-server-message-handler';
import { createClientMessageHandler } from './create-client-message-handler';
import * as Electron from 'electron';
import * as Ephemeral from './ephemeral-store';
import * as Events from 'events';
import * as getPort from 'get-port';
import * as Message from '../message';
import { Sender } from '../sender/server';
import { createServer } from '../server';
import { createWindow } from './create-window';
import * as uuid from 'uuid';

const log = require('electron-log');

export interface AppContext {
	port: undefined | number;
	sender: undefined | Sender;
	win: undefined | Electron.BrowserWindow;
}

export async function startApp(ctx: AppContext): Promise<{ emitter: Events.EventEmitter }> {
	log.info('App starting...');
	ctx.win = ctx.win ? ctx.win : (await createWindow()).window;
	const emitter = new Events.EventEmitter();

	// Cast getPort return type from PromiseLike<number> to Promise<number>
	// to avoid async-promise tslint rule to produce errors here
	ctx.port = await (getPort({ port: 1879 }) as Promise<number>);

	const sender = new Sender();
	const server = createServer({ port: ctx.port, sender });
	const ephemeralStore = new Ephemeral.EphemeralStore();

	const serverMessageHandler = await createServerMessageHandler(ctx, {
		emitter,
		ephemeralStore,
		server,
		sender
	});

	const clientMessageHandler = await createClientMessageHandler({ sender });

	sender.use(message => server.emit('message', message));

	sender.receive(serverMessageHandler);
	server.on('client-message', clientMessageHandler);

	Electron.app.on('will-finish-launching', () => {
		Electron.app.on('open-file', async (event, path) => {
			event.preventDefault();

			if (!path) {
				return;
			}

			sender.send({
				id: uuid.v4(),
				type: Message.ServerMessageType.OpenFileRequest,
				payload: { path }
			});
		});
	});

	Electron.app.on('activate', async () => {
		if (process.platform === 'darwin' && !ctx.win) {
			ctx.win = (await createWindow()).window;
		}
	});

	await server.start();
	log.info(`App started on port ${ctx.port}.`);

	startUpdater();

	emitter.on('reload', async () => {
		log.info('App reloading ...');
		await server.stop();
		sender.stop();
		server.removeAllListeners();
		emitter.removeAllListeners();
		Electron.app.removeAllListeners();
		stopUpdater();
	});

	return { emitter };
}
