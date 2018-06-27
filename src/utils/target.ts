import * as Model from '../model';
import * as Store from '../store';
import * as Components from '../components';

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

// Model Page Utils
export function pageFromTarget(
	target: EventTarget,
	store: Store.ViewStore
): Model.Page | undefined {
	const nodeEl = above(target, `[${Components.ElementAnchors.element}]`);
	if (!nodeEl) {
		return;
	}
	const pageId = nodeEl.getAttribute(Components.PageAnchors.page);

	if (typeof pageId !== 'string') {
		return;
	}

	const page = store.getPageById(pageId);

	if (!page) {
		return;
	}

	return page;
}

// Model Element Utils
export function elementFromTarget(
	target: EventTarget,
	options: { sibling: boolean; store: Store.ViewStore }
): Model.Element | undefined {
	const el = above(target, `[${Components.ElementAnchors.element}]`);

	if (!el) {
		return;
	}

	const id = el.getAttribute(Components.ElementAnchors.element);

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
	const el = above(target, `[${Components.ElementAnchors.content}]`);

	if (!el) {
		return;
	}

	const id = el.getAttribute(Components.ElementAnchors.content);

	if (typeof id !== 'string') {
		return;
	}

	return options.store.getContentById(id);
}
