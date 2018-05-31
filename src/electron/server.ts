import { createCompiler } from '../compiler/create-compiler';
import * as Electron from 'electron';
import { EventEmitter } from 'events';
import * as express from 'express';
import * as Http from 'http';
import { isEqual } from 'lodash';
import { ServerMessage, ServerMessageType } from '../message';
import { previewDocument, PreviewDocumentMode } from '../preview/preview-document';
import * as Types from '../model/types';
import * as Url from 'url';
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

		ws.on('message', envelope => {
			emitter.emit('client-message', envelope);

			try {
				const message = JSON.parse(String(envelope));

				switch (message.type) {
					case 'click-element': {
						const element = (state.payload.elements || []).find(
							e => e.id === message.payload.id
						);

						if (!element) {
							return;
						}

						const hrefPatternProp = (state.payload.patternProperties || []).find(
							p => p.type === 'href'
						);

						if (!hrefPatternProp) {
							return;
						}

						const hrefElementProp = element.properties.find(
							p => p.patternPropertyId === hrefPatternProp.id
						);

						if (
							hrefElementProp &&
							typeof hrefElementProp.value === 'string' &&
							hrefElementProp.value
						) {
							const parsed = Url.parse(hrefElementProp.value);

							if (['http:', 'https:'].includes(parsed.protocol || '')) {
								Electron.shell.openExternal(hrefElementProp.value);
							}
						}
					}
				}
			} catch (err) {
				console.error(err);
			}
		});
		ws.send(JSON.stringify(state));
	});

	app.get('/preview.html', (req, res) => {
		res.type('html');

		const mode = getMode(req.query.mode || '');

		if (mode === PreviewDocumentMode.Static) {
			res.send(
				previewDocument({
					content: '',
					mode,
					data: state,
					scripts: ''
				})
			);
			return;
		}

		res.send(
			previewDocument({
				mode,
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
				state.payload.bundle = message.payload.bundle;
				state.payload.patternProperties = message.payload.patternProperties;
				state.payload.patterns = message.payload.patterns;

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
						payload: {
							patternProperties: message.payload.patternProperties,
							patterns: message.payload.patterns
						}
					});
				});

				next.compiler.hooks.done.tap('alva', stats => {
					compilation.listeners.forEach(l => l(compilation.compiler.outputFileSystem));
				});

				send({
					type: 'update',
					id: uuid.v4(),
					payload: {
						patternProperties: message.payload.patternProperties,
						patterns: message.payload.patterns
					}
				});

				break;
			}
			case ServerMessageType.PageChange: {
				// tslint:disable-next-line:no-any
				const diff: any = {};

				if (!isEqual(state.payload.elementContents, message.payload.elementContents)) {
					diff.elementContents = message.payload.elementContents;
				}

				if (!isEqual(state.payload.elements, message.payload.elements)) {
					diff.elements = message.payload.elements;
				}

				if (!isEqual(state.payload.pages, message.payload.pages)) {
					diff.pages = message.payload.pages;
				}

				if (state.payload.pageId !== message.payload.pageId) {
					diff.pageId = message.payload.pageId;
				}

				Object.assign(state.payload, diff);

				send({
					id: state.id,
					type: state.type,
					path: state.path,
					payload: diff
				});

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

function getMode(input: string): PreviewDocumentMode {
	switch (input) {
		case PreviewDocumentMode['LiveMirror']:
			return PreviewDocumentMode.LiveMirror;
		case PreviewDocumentMode['Static']:
			return PreviewDocumentMode.Static;
		case PreviewDocumentMode['Live']:
		default:
			return PreviewDocumentMode.Live;
	}
}
