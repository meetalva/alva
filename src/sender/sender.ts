// tslint:disable:no-non-null-assertion
import * as AlvaUtil from '../alva-util';
import * as Message from '../message';
import { isMessage } from './is-message';
import { isMessageType } from './is-message-type';
import * as Serde from './serde';
import * as uuid from 'uuid';
import { EventEmitter } from 'electron';

// tslint:disable-next-line:no-eval
const WS = typeof window !== 'undefined' ? WebSocket : (eval('require("ws")') as typeof WebSocket);

export interface SenderInit {
	endpoint: string;
	autostart?: boolean;
}

export type Matcher = (message: Message.Message) => void;

export class Sender {
	private endpoint: string;
	private connection: WebSocket;
	private queue: Set<string> = new Set();
	private matchers: Map<Message.MessageType, Matcher[]> = new Map();
	private retry: number = 0;

	private get ready(): boolean {
		if (!this.connection) {
			return false;
		}

		return this.connection.readyState === WS.OPEN;
	}

	public constructor(init: SenderInit) {
		this.endpoint = init.endpoint;

		if (init.autostart !== false) {
			this.start();
		}
	}

	private onConnectionMessage = (e: MessageEvent): void => {
		const header = Serde.getMessageHeader(e.data);

		if (header.status === Serde.MessageHeaderStatus.Error) {
			console.error(header);
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

	private onConnectionClose = (e: CloseEvent) => {
		if (e.code === 1000) {
			return;
		}

		this.restart();
	};

	public async start(): Promise<void> {
		try {
			this.connection = new WS(this.endpoint);
			this.connection.addEventListener('message', this.onConnectionMessage);
			this.connection.addEventListener('close', this.onConnectionClose);
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
		this.connection.send(envelope);
	}

	public async send(message: Message.Message): Promise<void> {
		if (!isMessage(message)) {
			console.error(`Tried to send invalid message: ${message}`);
			return;
		}

		if (!this.ready) {
			this.queue.add(Serde.serialize(message));
			return;
		}

		const matchers = this.matchers.get(message.type);

		if (matchers) {
			matchers.forEach(matcher => matcher(message));
		}

		this.connection.send(Serde.serialize(message));
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

	public transaction<T extends Message.Message>(
		message: Message.Message,
		{ type }: { type: T['type'] }
	): Promise<T> {
		return new Promise<T>(resolve => {
			const transaction = uuid.v4();
			let done = false;

			const match = (msg: T) => {
				if (!isMessage(msg) || done) {
					return;
				}

				if (transaction !== msg.transaction) {
					return;
				}

				done = true;
				this.unmatch(type, match);
				resolve(msg as T);
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
