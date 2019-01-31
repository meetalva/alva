import * as Components from '@meetalva/components';

export interface PageProvider<T> {
	getPageById(id: string): T | undefined;
}

export interface ElementProvider<T extends WithParent<T>> {
	getElementById(id: string): T | undefined;
}

export interface ElementContentProvider<T> {
	getContentById(id: string): T | undefined;
}

export interface WithParent<T> {
	getParent(): T | undefined;
}

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

export function pageFromTarget<T>(target: EventTarget, store: PageProvider<T>): T | undefined {
	const el = above(target, `[${Components.PageAnchors.page}]`);
	if (!el) {
		return;
	}
	const pageId = el.getAttribute(Components.PageAnchors.page);

	if (typeof pageId !== 'string') {
		return;
	}

	const page = store.getPageById(pageId);

	if (!page) {
		return;
	}

	return page;
}

export function elementFromTarget<T extends WithParent<T>>(
	target: EventTarget,
	options: { sibling: boolean; store: ElementProvider<T> }
): T | undefined {
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

export function elementContentFromTarget<T>(
	target: EventTarget,
	options: { store: ElementContentProvider<T> }
): T | undefined {
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
