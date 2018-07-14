import { createConnectionHandler } from './create-connection-handler';
import { createLibrariesRoute } from './create-libraries-route';
import { createPreviewRoute } from './create-preview-route';
import { createScreenshotRoute } from './create-screenshot-route';
import { createScriptsRoute } from './create-scripts-route';
import { createSketchRoute } from './create-sketch-route';
import { createStaticRoute } from './create-static-route';
import { createServerMessageHandler } from './create-server-message-handler';
import { EventEmitter } from 'events';
import * as express from 'express';
import * as Http from 'http';
import * as Message from '../message';
import * as WS from 'ws';
import { isMessage } from '../sender/is-message';
import { Sender } from '../sender/server';

export interface ServerOptions {
	port: number;
	sender: Sender;
}

export interface AlvaServerInit {
	options: ServerOptions;
	server: Http.Server;
	app: express.Express;
	webSocketServer: WS.Server;
}

export class AlvaServer extends EventEmitter {
	private options: ServerOptions;
	private app: express.Express;
	private server: Http.Server;
	private webSocketServer: WS.Server;

	public constructor(init: AlvaServerInit) {
		super();
		this.app = init.app;
		this.options = init.options;
		this.server = init.server;
		this.webSocketServer = init.webSocketServer;

		this.app.get('/', (_, res) => res.send('ok'));

		this.app.get('/preview.html', createPreviewRoute({ sender: this.options.sender }));

		this.app.use('/static', createStaticRoute({ sender: this.options.sender }));

		this.app.use(
			'/sketch',
			createSketchRoute({
				previewLocation: `http://localhost:${this.options.port}/sketch`,
				sender: this.options.sender
			})
		);

		this.app.use(
			'/screenshots',
			createScreenshotRoute({
				previewLocation: `http://localhost:${this.options.port}/static`,
				sender: this.options.sender
			})
		);

		this.app.use('/scripts', createScriptsRoute());
		this.app.use('/libraries', createLibrariesRoute({ sender: this.options.sender }));

		this.webSocketServer.on('connection', createConnectionHandler({ emitter: this }));
		this.on('message', createServerMessageHandler({ webSocketServer: this.webSocketServer }));
	}

	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.server.once('error', reject);
			this.server.listen(this.options.port, () => resolve());
		});
	}

	public stop(): Promise<void> {
		return new Promise(resolve => this.server.close(resolve));
	}

	public emit(name: 'client-message' | 'message', message: Message.Message): boolean {
		if (!isMessage(message)) {
			return false;
		}

		return super.emit(name, message);
	}

	public on(name: 'client-message' | 'message', handler: (e: Message.Message) => void): this {
		// tslint:disable-next-line:no-any
		super.on(name, (message: any) => {
			if (!isMessage(message)) {
				return;
			}
			handler(message);
		});
		return this;
	}
}

export function createServer(options: ServerOptions): AlvaServer {
	const app = express();
	const server = Http.createServer(app);

	return new AlvaServer({
		options,
		app,
		server,
		webSocketServer: new WS.Server({ server })
	});
}
