import { Message } from './message';

export interface Sender {
	readonly id: string;

	match<T extends Message>(type: Message['type'], handler: (message: T) => void): Promise<void>;

	unmatch<T extends Message>(type: Message['type'], handler: (message: T) => void): Promise<void>;

	send(message: Message): void;

	pass(envelope: string): void;

	transaction<T extends Message, V extends Message>(
		message: Message,
		{ type }: { type: V['type'] }
	): Promise<V>;

	setLog(log: undefined | typeof console.log): void;
}
