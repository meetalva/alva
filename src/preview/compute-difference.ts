// import * as _ from 'lodash';

export interface Difference<T> {
	added: AddItem<T>[];
	changed: ChangeItem<T>[];
	removed: RemoveItem<T>[];
}

export interface AddItem<T> {
	before: undefined;
	after: T;
}

export interface ChangeItem<T> {
	before: T;
	after: T;
}

export interface RemoveItem<T> {
	before: T;
	after: undefined;
}

export type Diffable<T> = Identifyable & Equalifyable<T>;

export interface Identifyable {
	getId(): string;
}

export interface Equalifyable<T> {
	equals(this: T, a: T): boolean;
}

export function computeDifference<T extends Diffable<T>>(a: T[], b: T[]): Difference<T> {
	const added = a.filter(ai => !b.find(bi => bi.getId() === ai.getId()));

	const removed = b
		.filter(bi => !added.includes(bi))
		.filter(bi => !b.find(ai => ai.getId() === ai.getId()));

	const changed = a
		.filter(item => !added.includes(item))
		.filter(el => !removed.includes(el))
		.filter(ai => {
			const aid = ai.getId();
			const bi = b.find(i => i.getId() === aid);
			return bi && !ai.equals(bi);
		});

	return {
		added: added.map(item => ({ before: undefined, after: item })),
		changed: changed.map(after => ({
			after,
			before: b.find(bc => after.getId() === bc.getId()) as T
		})),
		removed: removed.map(item => ({ before: item, after: undefined }))
	};
}

/* function withEquals<T extends Equalifyable<T>>(a: T, b: T): boolean {
	return a.equals(b);
}

function withId<T extends Diffable<T>>(a: T, b: T): boolean {
	return a.getId() === b.getId();
} */
