import * as Model from '../model';

export function calculateDropIndex(init: {
	dragged: Model.Element;
	target: Model.Element;
}): number {
	const { dragged, target } = init;

	// We definitely know the drop target has a parent, thus an index
	const newIndex = target.getIndex() as number;

	// The dragged element is dropped into another
	// leaf list than it was dragged from.
	// True for (1) new elements, (2) elements dragged to other parents
	if (dragged.getContainer() !== target.getContainer()) {
		return newIndex;
	}

	// If the dragged element has a parent, it has an index
	const currentIndex = dragged.getIndex();

	// The dragged element is dropped in the same leaf
	// list as it was dragged from.
	// Offset the index by the element itself missing from the new list.
	if (newIndex > currentIndex) {
		return newIndex - 1;
	}

	return newIndex;
}
