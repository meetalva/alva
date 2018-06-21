import * as Model from '../model';
import * as Store from '../store';
import { ElementAnchors } from '../components';

export function above(node: EventTarget, selector: string): HTMLElement | null {
	let el = node as HTMLElement;
	let ended = false;

	while (el && !ended) {
		if (el.matches(selector)) {
			break;
		}

		if (el.parentElement !== null) {
			el = el.parentElement;
		} else {
			ended = true;
			break;
		}
	}

	return ended ? null : el;
}

export function elementFromTarget(
	target: EventTarget,
	options: { sibling: boolean; store: Store.ViewStore }
): Model.Element | undefined {
	const el = above(target, `[${ElementAnchors.element}]`);

	if (!el) {
		return;
	}

	const id = el.getAttribute(ElementAnchors.element);

	if (typeof id !== 'string') {
		return;
	}

	const element = options.store.getElementById(id);

	if (!element) {
		return;
	}

	return options.sibling ? element.getParent() : element;
}

export function elementContentFromTarget(
	target: EventTarget,
	options: { store: Store.ViewStore }
): Model.ElementContent | undefined {
	const el = above(target, `[${ElementAnchors.content}]`);

	if (!el) {
		return;
	}

	const id = el.getAttribute(ElementAnchors.content);

	if (typeof id !== 'string') {
		return;
	}

	return options.store.getContentById(id);
}
