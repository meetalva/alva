import * as Message from '../message';

export interface Sender {
	match<T extends Message.Message>(
		type: Message.Message['type'],
		handler: (message: T) => void
	): Promise<void>;

	send(message: Message.Message): void;

	pass(envelope: string): void;

	transaction<T extends Message.Message, V extends Message.Message>(
		message: Message.Message,
		{ type }: { type: V['type'] }
	): Promise<V>;
}
