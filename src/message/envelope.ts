export interface Envelope<V, T> {
	id: string;
	appId?: string;
	transaction?: string;
	sender?: string[];
	payload: T;
	type: V;
}

export type EmptyEnvelope<V> = Envelope<V, undefined>;
