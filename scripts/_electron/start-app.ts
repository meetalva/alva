// import { startUpdater, stopUpdater } from './auto-updater';
import { createServerMessageHandler } from './create-server-message-handler';
import * as Electron from 'electron';
import * as Ephemeral from './ephemeral-store';
import * as Express from 'express';
import * as Events from 'events';
import * as Message from '../message';
import * as Mobx from 'mobx';
import * as Model from '../model';
import * as Fs from 'fs';
import { Sender } from '../sender/server';
import { showMainMenu } from './show-main-menu';
import { createServer } from '../server';
import * as uuid from 'uuid';

import { AlvaContext } from './alva-context';
import { AlvaWindow } from './alva-window';

const log = require('electron-log');

export interface AppContext {
	app: undefined | Model.AlvaApp;
	appPath: string;
	base: undefined | string;
	hot: undefined | boolean;
	port: undefined | number;
	sender: undefined | Sender;
	middlewares: Express.RequestHandler[];
	fileToOpen: string | undefined;
	windows: Map<string, AlvaWindow>;
	projects: Map<string, Model.Project>;
}

export async function startApp(context: AlvaContext): Promise<{ emitter: Events.EventEmitter }> {
	log.info(`App starting ${context.hot ? 'with hot reloading' : ''}...`);
	const emitter = new Events.EventEmitter();

	const server = createServer({ context });

	log.info('App started.');
	return { emitter };

	/* log.info(`App starting ${ctx.hot ? 'with hot reloading' : ''}...`);

	const emitter = new Events.EventEmitter();

	const server = createServer({ port: ctx.port, sender, context: ctx });
	const ephemeralStore = new Ephemeral.EphemeralStore();

	// const syncing = new WeakSet<Model.Project>();

	showMainMenu({ app: ctx.app, projects: ctx.projects }, { sender });

	const dispose = Mobx.autorun(() => {
		if (ctx.app) {
			// ephemeralStore.setAppState(ctx.app.toJSON());
		}

		// if (ctx.project && !syncing.has(ctx.project)) {
		// 	syncing.add(ctx.project);
		// 	ctx.project.sync(sender);
		// }
	});

	const serverMessageHandler = await createServerMessageHandler(ctx, {
		emitter,
		ephemeralStore,
		server,
		sender
	});

	sender.receive(serverMessageHandler);

	server.on('client-message', e => sender.send(e));

	Mobx.reaction(
		() => ctx.fileToOpen,
		() => {
			if (!ctx.fileToOpen) {
				return;
			}

			// TODO: Move check to persistence.read and return appropriate error message.
			if (!Fs.existsSync(ctx.fileToOpen)) {
				return;
			}

			sender.send({
				id: uuid.v4(),
				type: Message.MessageType.OpenFileRequest,
				payload: { path: ctx.fileToOpen }
			});
		},
		{
			fireImmediately: true
		}
	);

	// const onClose = e => {
	// 	e.preventDefault();
	// 	sender.send({
	// 		type: Message.MessageType.WindowClose,
	// 		id: uuid.v4(),
	// 		payload: undefined
	// 	});
	// };

	Electron.app.on('before-quit', async () => {
		// await Mobx.when(() => typeof ctx.project === 'undefined');
		process.exit();
	});

	Electron.app.on('activate', async () => {
		if (process.platform === 'darwin') {
			// ctx.win = (await createWindow({ port: ctx.port as number })).window;
			// tslint:disable-next-line:no-non-null-assertion
			// ctx.win!.addListener('close', onClose);
		}
	});

	await server.start();
	log.info(`Server started on port ${ctx.port}.`);

	// TODO: Restore windows or show splash

	// if (ctx.win) {
	// 	ctx.win.loadURL(`http://localhost:${ctx.port}/`);
	// } else {
	// 	ctx.win = (await createWindow({ port: ctx.port as number })).window;
	// }

	// if (ctx.win) {
	// 	ctx.win.addListener('close', onClose);
	// }

	startUpdater();

	emitter.once('reload', async payload => {
		log.info(`App reloading ${payload.forced ? 'forcefully' : ''}...`);

		if (payload && payload !== null && payload.forced) {
			ephemeralStore.clear();
		}

		dispose();
		await server.stop();
		sender.stop();
		server.removeAllListeners();
		emitter.removeAllListeners();
		Electron.app.removeAllListeners();

		// if (ctx.win) {
		// 	ctx.win.removeAllListeners();
		// 	ctx.win.addListener('close', onClose);
		// }

		stopUpdater();
	});

	log.info('App started.');
	return { emitter }; */
}
