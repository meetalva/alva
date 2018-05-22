import { createCompiler } from '../compiler/create-compiler';
import { EventEmitter } from 'events';
import * as express from 'express';
import * as Http from 'http';
import { ServerMessage, ServerMessageType } from '../message';
import { previewDocument, PreviewDocumentMode } from '../preview/preview-document';
import * as Types from '../model/types';
import * as uuid from 'uuid';
import { Compiler } from 'webpack';
import { OPEN, Server as WebsocketServer } from 'ws';

export interface ServerOptions {
	port: number;
}

// TODO: Divvy up server state from preview state to
// e.g. not send the bundle over the wire
interface State {
	id: string;
	path?: string;
	payload: {
		bundle?: string;
		elementContents?: Types.SerializedElementContent[];
		elementId?: string;
		elements?: Types.SerializedElement[];
		pageId?: string;
		pages?: Types.SerializedPage[];
		patternProperties?: Types.SerializedPatternProperty[];
		patterns?: Types.SerializedPattern[];
	};
	type: 'state';
}

enum WebpackMessageType {
	Start = 'start',
	Done = 'done',
	Error = 'error'
}

interface WebpackMessage {
	id: string;
	payload?: object;
	type: WebpackMessageType;
}

// tslint:disable-next-line:no-any
type Queue = WebpackMessage[];

export async function createServer(opts: ServerOptions): Promise<EventEmitter> {
	const emitter = new EventEmitter();
	const app = express();

	const server = Http.createServer(app);
	const wss = new WebsocketServer({ server });

	const state: State = {
		id: uuid.v4(),
		type: 'state',
		payload: {}
	};

	// tslint:disable-next-line:no-any
	const compilation: any = {
		path: '',
		queue: [],
		listeners: []
	};

	// Prevent client errors (frequently caused by Chrome disconnecting on reload)
	// from bubbling up and making the server fail, ref: https://github.com/websockets/ws/issues/1256
	wss.on('connection', ws => {
		ws.on('error', err => {
			console.error(err);
		});

		ws.on('message', message => emitter.emit('client-message', message));
		ws.send(JSON.stringify(state));
	});

	app.get('/preview.html', (req, res) => {
		res.type('html');
		res.send(
			previewDocument({
				mode: PreviewDocumentMode.Live,
				data: state
			})
		);
	});

	app.use('/scripts', (req, res, next) => {
		if (req.path === '/components.js') {
			res.type('js');
			res.send(state.payload.bundle || '');
			return;
		}

		const [current] = compilation.queue;

		if (!current) {
			next();
			return;
		}

		// tslint:disable-next-line:no-any
		const onReady = (fs: any): void => {
			compilation.listeners = compilation.listeners.filter(l => l !== onReady);

			try {
				res.type('js');
				res.send(fs.readFileSync(req.path));
			} catch (err) {
				if (err.code === 'ENOENT') {
					res.sendStatus(404);
					return;
				}
				res.sendStatus(500);
			}
		};

		if (current.type === 'start') {
			compilation.listeners.push(onReady);
		} else {
			onReady(compilation.compiler.outputFileSystem);
		}
	});

	// tslint:disable-next-line:no-any
	const send = (message: any): void => {
		wss.clients.forEach(client => {
			if (client.readyState === OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	};

	emitter.on('message', async (message: ServerMessage) => {
		switch (message.type) {
			case ServerMessageType.PatternLibraryChange: {
				Object.assign(state.payload, message.payload);

				if (compilation.compiler && typeof compilation.compiler.close === 'function') {
					compilation.compiler.close();
				}

				const next = await setup();

				compilation.compiler = next.compiler;
				compilation.queue = next.queue;
				compilation.listeners = [];

				next.compiler.hooks.watchRun.tap('alva', () => {
					send({
						type: 'update',
						id: uuid.v4(),
						payload: {}
					});
				});

				next.compiler.hooks.done.tap('alva', stats => {
					compilation.listeners.forEach(l => l(compilation.compiler.outputFileSystem));
				});

				send({
					type: 'update',
					id: uuid.v4(),
					payload: {}
				});

				break;
			}
			case ServerMessageType.PageChange: {
				state.payload.elementContents = message.payload.elementContents;
				state.payload.elements = message.payload.elements;
				state.payload.pageId = message.payload.pageId;
				state.payload.pages = message.payload.pages;
				send(state);
				break;
			}
			case ServerMessageType.ElementChange: {
				state.payload.elementId = message.payload;
				send(message);
				break;
			}
			case ServerMessageType.SketchExportRequest:
			case ServerMessageType.ContentRequest: {
				send(message);
			}
		}
	});

	await startServer({
		server,
		port: opts.port
	});

	return emitter;
}

interface ServerStartOptions {
	port: number;
	server: Http.Server;
}

// tslint:disable-next-line:promise-function-async
function startServer(options: ServerStartOptions): Promise<void> {
	return new Promise((resolve, reject) => {
		options.server.once('error', reject);
		options.server.listen(options.port, resolve);
	});
}

async function setup(): Promise<{ compiler: Compiler; queue: Queue }> {
	const queue: Queue = [];

	const compiler = createCompiler([], { cwd: process.cwd(), infrastructure: true });

	compiler.hooks.compile.tap('alva', () => {
		queue.unshift({ type: WebpackMessageType.Start, id: uuid.v4() });
	});

	compiler.hooks.done.tap('alva', stats => {
		if (stats.hasErrors()) {
			queue.unshift({
				type: WebpackMessageType.Error,
				payload: stats.toJson('errors-only'),
				id: uuid.v4()
			});
		}
		queue.unshift({ type: WebpackMessageType.Done, id: uuid.v4() });
	});

	// tslint:disable-next-line:no-empty
	compiler.watch({}, (err, stats) => {});

	return {
		compiler,
		queue
	};
}
