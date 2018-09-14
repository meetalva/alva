import { startUpdater, stopUpdater } from './auto-updater';
import { createServerMessageHandler } from './create-server-message-handler';
import * as Electron from 'electron';
import * as Ephemeral from './ephemeral-store';
import * as Express from 'express';
import * as Events from 'events';
import * as getPort from 'get-port';
import * as Message from '../message';
import * as Mobx from 'mobx';
import * as Model from '../model';
import { Sender } from '../sender/server';
import { showMainMenu } from './show-main-menu';
import { showDiscardDialog, DiscardDialogResult } from './show-discard-dialog';
import { showError } from './show-error';
import { createServer } from '../server';
import { createWindow } from './create-window';
import * as Types from '../types';
import * as uuid from 'uuid';

const log = require('electron-log');

export interface AppContext {
	app: undefined | Model.AlvaApp;
	appPath: string;
	base: undefined | string;
	hot: undefined | boolean;
	project: undefined | Model.Project;
	port: undefined | number;
	sender: undefined | Sender;
	win: undefined | Electron.BrowserWindow;
	middlewares: Express.RequestHandler[];
}

export async function startApp(ctx: AppContext): Promise<{ emitter: Events.EventEmitter }> {
	log.info(`App starting ${ctx.hot ? 'with hot reloading' : ''}...`);

	const emitter = new Events.EventEmitter();

	// Cast getPort return type from PromiseLike<number> to Promise<number>
	// to avoid async-promise tslint rule to produce errors here
	ctx.port = await (getPort({ port: ctx.port }) as Promise<number>);

	const sender = new Sender();
	const server = createServer({ port: ctx.port, sender, context: ctx });
	const ephemeralStore = new Ephemeral.EphemeralStore();

	const syncing = new WeakSet<Model.Project>();

	const dispose = Mobx.autorun(() => {
		if (ctx.app) {
			ephemeralStore.setAppState(ctx.app.toJSON());
			showMainMenu({ app: ctx.app, project: ctx.project }, { sender });
		}

		if (ctx.project && !syncing.has(ctx.project)) {
			syncing.add(ctx.project);
			ctx.project.sync(sender);
		}
	});

	const serverMessageHandler = await createServerMessageHandler(ctx, {
		emitter,
		ephemeralStore,
		server,
		sender
	});

	sender.receive(serverMessageHandler);

	server.on('client-message', e => sender.send(e));

	Electron.app.on('will-finish-launching', () => {
		Electron.app.on('open-file', async (event, path) => {
			event.preventDefault();

			if (!path) {
				return;
			}

			sender.send({
				id: uuid.v4(),
				type: Message.MessageType.OpenFileRequest,
				payload: { path }
			});
		});
	});

	Electron.app.on('before-quit', async () => {
		await Mobx.when(() => typeof ctx.project === 'undefined');
		process.exit();
	});

	const onClose = async e => {
		if (!ctx.project || !ctx.project.getDraft()) {
			return;
		}

		e.preventDefault();
		const result = await showDiscardDialog(ctx.project);

		switch (result) {
			case DiscardDialogResult.Discard:
				ephemeralStore.clear();
				ctx.project = undefined;
				if (ctx.win) {
					ctx.win.hide();
				}
				break;
			case DiscardDialogResult.Save:
				const saveResult = await sender.transaction(
					{
						id: uuid.v4(),
						type: Message.MessageType.Save,
						payload: { publish: true }
					},
					{ type: Message.MessageType.SaveResult }
				);

				if (saveResult.payload.result === Types.PersistenceState.Error) {
					return showError(saveResult.payload.result.error);
				}

				// Give the user some time to realize we saved
				setTimeout(() => {
					ctx.win && ctx.win.hide();
					ctx.project = undefined;
				}, 1000);
				break;
			case DiscardDialogResult.Cancel:
			default:
				return;
		}
	};

	Electron.app.on('activate', async () => {
		if (process.platform === 'darwin' && !ctx.win) {
			ctx.win = (await createWindow({ port: ctx.port as number })).window;
			// tslint:disable-next-line:no-non-null-assertion
			ctx.win!.addListener('close', onClose);
		}
	});

	await server.start();
	log.info(`Server started on port ${ctx.port}.`);

	if (ctx.win) {
		ctx.win.loadURL(`http://localhost:${ctx.port}/`);
	} else {
		ctx.win = (await createWindow({ port: ctx.port as number })).window;
	}

	if (ctx.win) {
		ctx.win.addListener('close', onClose);
	}

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

		if (ctx.win) {
			ctx.win.removeAllListeners();
			ctx.win.addListener('close', onClose);
		}

		stopUpdater();
	});

	log.info('App started.');
	return { emitter };
}
