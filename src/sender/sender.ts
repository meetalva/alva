// tslint:disable:no-non-null-assertion
import * as AlvaUtil from '../alva-util';
import * as Message from '../message';
import { isMessage } from './is-message';
import { isMessageType } from './is-message-type';
import * as Serde from './serde';
import * as uuid from 'uuid';
import { EventEmitter } from 'electron';
import * as Types from '../types';

// tslint:disable-next-line:no-eval
const WS = typeof window !== 'undefined' ? WebSocket : (eval('require("ws")') as typeof WebSocket);

export interface WebSocketInit {
	endpoint: string;
	autostart?: boolean;
}

export interface PostMessageInit {
	window: Window;
	autostart?: boolean;
}

export interface MixedInit {
	endpoint: string;
	window: Window;
	autostart?: boolean;
}

export type SenderInit = WebSocketInit | PostMessageInit | MixedInit;

export type Matcher = (message: Message.Message) => void;

export class Sender implements Types.Sender {
	public readonly id: string;
	private endpoint: string;
	private window: Window;
	private connection: WebSocket;
	private queue: Set<string> = new Set();
	private matchers: Map<Message.MessageType, Matcher[]> = new Map();
	private retry: number = 0;

	private get ready(): boolean {
		if (!this.endpoint) {
			return true;
		}

		if (!this.connection) {
			return false;
		}

		return this.connection.readyState === WS.OPEN;
	}

	public constructor(init: SenderInit) {
		this.id = uuid.v4();

		if (init.hasOwnProperty('endpoint')) {
			const ini = init as WebSocketInit;
			this.endpoint = ini.endpoint;
		}

		if (init.hasOwnProperty('window')) {
			const ini = init as PostMessageInit;
			this.window = ini.window;
		}

		if (init.autostart !== false) {
			this.start();
		}
	}

	private onClose = (e: CloseEvent) => {
		if (e.code === 1000) {
			return;
		}

		this.restart();
	};

	private onMessage = (e: MessageEvent): void => {
		const header = Serde.getMessageHeader(e.data);

		if (header.status === Serde.MessageHeaderStatus.Error) {
			return;
		}

		if (!isMessageType(header.type)) {
			return;
		}

		const matchers = this.matchers.get(header.type);

		if (!matchers) {
			return;
		}

		const body = Serde.getMessageBody(e.data);

		if (!body) {
			return;
		}

		// tslint:disable-next-line:no-any
		const parseResult = AlvaUtil.parseJSON<any>(body);

		if (parseResult.type === AlvaUtil.ParseResultType.Error) {
			return;
		}

		if (!isMessage(parseResult.result)) {
			return;
		}

		if (parseResult.result.type !== header.type) {
			return;
		}

		matchers.forEach(matcher => matcher(parseResult.result));
	};

	public async start(): Promise<void> {
		if (typeof window !== 'undefined') {
			window.addEventListener('message', this.onMessage);
		}

		if (this.endpoint) {
			try {
				this.connection = new WS(this.endpoint);
				this.connection.addEventListener('message', this.onMessage);
				this.connection.addEventListener('close', this.onClose);
			} catch (err) {
				return this.restart();
			}

			await onReady(this.connection);

			this.queue.forEach(async message => {
				this.pass(message);
				this.queue.delete(message);
			});

			this.retry = 0;
		}
	}

	public setWindow(win: Window): void {
		if (typeof window !== 'undefined') {
			this.window = win;
		}
	}

	public async stop(): Promise<void> {
		if (this.connection && (this.connection as any).removeAllListeners) {
			((this.connection as any) as EventEmitter).removeAllListeners();
		}
	}

	public async restart(): Promise<void> {
		if (this.retry >= 12) {
			throw new Error(`Aborted Sennder reconnecting after 12 tries`);
		}

		this.retry++;
		await this.stop();
		await wait(Math.pow(2, this.retry));
		return this.start();
	}

	public pass(envelope: string): void {
		if (this.connection) {
			this.connection.send(envelope);
		}

		if (this.window) {
			this.window.postMessage(envelope, '*');
		}
	}

	public async send(message: Message.Message): Promise<void> {
		if (!isMessage(message)) {
			console.error(`Tried to send invalid message: ${message}`);
			return;
		}

		if (!this.ready) {
			if (this.window) {
				const m = message;
				const base: string[] = Array.isArray(message.sender) ? message.sender : [];
				m.sender = [...base, this.id];
				const e = Serde.serialize(message);
				this.window.postMessage(e, '*');
			}

			this.queue.add(Serde.serialize(message));
			return;
		}

		const base: string[] = Array.isArray(message.sender) ? message.sender : [];
		message.sender = [...base, this.id];

		const matchers = this.matchers.get(message.type);

		if (matchers) {
			matchers.forEach(matcher => matcher(message));
		}

		const envelope = Serde.serialize(message);

		if (this.window) {
			this.window.postMessage(envelope, '*');
		}

		if (this.connection) {
			this.connection.send(envelope);
		}
	}

	public async match<T extends Message.Message>(
		type: Message.Message['type'],
		handler: (message: T) => void
	): Promise<void> {
		const base = this.matchers.has(type) ? this.matchers.get(type)! : [];

		this.matchers.set(type, [...base, handler]);
	}

	public async unmatch<T extends Message.Message>(
		type: Message.Message['type'],
		handler: (message: T) => void
	): Promise<void> {
		if (!this.matchers.has(type)) {
			return;
		}

		this.matchers.set(type, this.matchers.get(type)!.filter(m => m !== handler));
	}

	public transaction<T extends Message.Message, V extends Message.Message>(
		message: Message.Message,
		{ type }: { type: V['type'] }
	): Promise<V> {
		return new Promise<V>(resolve => {
			const transaction = uuid.v4();
			let done = false;

			const match = (msg: V) => {
				if (!isMessage(msg) || done) {
					return;
				}

				if (transaction !== msg.transaction) {
					return;
				}

				done = true;
				this.unmatch(type, match);
				resolve(msg as V);
			};

			this.match(type, match);

			this.send({
				...message,
				transaction
			});
		});
	}
}

function onReady(connection: WebSocket): Promise<void> {
	return new Promise(resolve => {
		switch (connection.readyState) {
			case WS.CONNECTING:
				return connection.addEventListener('open', () => resolve(undefined));
			case WS.OPEN:
				return resolve(undefined);
		}
	});
}

function wait(delay: number): Promise<void> {
	return new Promise(r => setTimeout(() => r(), delay));
}
