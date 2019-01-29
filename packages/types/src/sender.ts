export interface SenderMessage {
	type: any;
	id: string;
	payload: unknown;
}

export interface Sender<M extends SenderMessage> {
	readonly id: string;

	match<T extends M>(
		type: T['type'],
		handler: (message: T) => void
	): Promise<void>;

	unmatch<T extends M>(
		type: T['type'],
		handler: (message: T) => void
	): Promise<void>;

	send<T extends M>(message: T): void;

	pass(envelope: string): void;

	transaction<T extends M, V extends M>(
		message: T,
		{ type }: { type: V['type'] }
	): Promise<V>;

	setLog(log: undefined | typeof console.log): void;
}
