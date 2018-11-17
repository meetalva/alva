export interface Envelope<V, T> {
	id: string;
	transaction?: string;
	sender?: string[];
	payload: T;
	type: V;
}

export type EmptyEnvelope<V> = Envelope<V, undefined>;
