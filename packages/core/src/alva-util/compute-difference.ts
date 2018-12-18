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

export function computeDifference<T extends Diffable<T>>(init: {
	before: T[];
	after: T[];
}): Difference<T> {
	const { before, after } = init;

	const added = after.filter(
		afterItem => !before.some(beforeItem => afterItem.getId() === beforeItem.getId())
	);

	const removed = before
		.filter(beforeItem => !added.some(addItem => addItem.getId() === beforeItem.getId()))
		.filter(beforeItem => !after.some(afterItem => afterItem.getId() === beforeItem.getId()));

	const changed = before
		.filter(beforeItem => !added.some(addItem => addItem.getId() === beforeItem.getId()))
		.filter(beforeItem => !removed.some(addItem => addItem.getId() === beforeItem.getId()))
		.filter(beforeItem => {
			const matchingAfterItem = after.find(
				afterItem => afterItem.getId() === beforeItem.getId()
			);
			return matchingAfterItem && !beforeItem.equals(matchingAfterItem);
		});

	return {
		added: added.map(item => ({ before: undefined, after: item })),
		changed: changed.map(beforeItem => ({
			after: after.find(afterItem => afterItem.getId() === beforeItem.getId()) as T,
			before: beforeItem
		})),
		removed: removed.map(item => ({ before: item, after: undefined }))
	};
}
