import * as HtmlSketchApp from '@brainly/html-sketchapp';
import { differenceBy } from 'lodash';
import { PreviewMessageType } from '../message';
import * as Mobx from 'mobx';
import { PreviewDocumentMode } from './preview-document';
import * as SmoothscrollPolyfill from 'smoothscroll-polyfill';
import * as Types from '../model/types';
import * as uuid from 'uuid';

// TODO: Produces a deprecation warning, find a way
// to dedupe MobX when upgrading to 4.x
Mobx.extras.shareGlobalState();

declare var renderer: Types.Renderer;

interface InitialData {
	data: {
		pageId: string;
		pages: Types.SerializedPage[];
	};
	mode: 'static' | 'live';
}

export class PreviewStore implements Types.RenderPreviewStore {
	@Mobx.observable public elementContents: Types.SerializedElementContent[] = [];

	@Mobx.observable public elementId: string = '';
	@Mobx.observable public elements: Types.SerializedElement[] = [];
	@Mobx.observable public mode: PreviewDocumentMode = PreviewDocumentMode.Live;
	@Mobx.observable public pageId: string = '';
	@Mobx.observable public pages: Types.SerializedPage[] = [];
	@Mobx.observable public patternProperties: Types.SerializedPatternProperty[] = [];
	@Mobx.observable public patterns: Types.SerializedPattern[] = [];

	private constructor() {}

	// tslint:disable-next-line:no-any
	public static from(data?: any): PreviewStore {
		if (!data) {
			return new PreviewStore();
		}

		if (!data.hasOwnProperty('payload')) {
			return new PreviewStore();
		}

		const payload = data.payload;
		const store = new PreviewStore();

		switch (payload.mode) {
			case 'static':
				store.mode = PreviewDocumentMode.Static;
				break;
			case 'live':
			default:
				store.mode = PreviewDocumentMode.Live;
		}

		if (payload.elementContents) {
			store.elementContents = payload.elementContents;
		}

		if (payload.elements) {
			store.elements = payload.elements;
		}

		if (payload.pageId) {
			store.pageId = payload.pageId;
		}

		if (payload.pages) {
			store.pages = payload.pages;
		}

		if (payload.patternProperties) {
			store.patternProperties = payload.patternProperties;
		}

		if (payload.patterns) {
			store.patterns = payload.patterns;
		}

		return store;
	}
}

function main(): void {
	SmoothscrollPolyfill.polyfill();

	const initialData = getInitialData();
	const store = PreviewStore.from(initialData ? initialData.data : undefined);

	const connection = new WebSocket(`ws://${window.location.host}`);

	const render = () => {
		renderer.render({
			getChildren: createChildrenGetter(store),
			getComponent: createComponentGetter(store),
			getProperties: createPropertiesGetter(store),
			getSlots: createSlotGetter(store),
			onElementClick: (e: MouseEvent, payload) => {
				e.preventDefault();
				connection.send(
					JSON.stringify({
						type: PreviewMessageType.SelectElement,
						id: uuid.v4(),
						payload
					})
				);
			},
			onOutsideClick: e => {
				e.preventDefault();

				connection.send(
					JSON.stringify({
						type: PreviewMessageType.UnselectElement,
						id: uuid.v4()
					})
				);
			},
			store
		});
	};

	if (store.mode === PreviewDocumentMode.Live) {
		listen(store, connection, {
			onReplacement(): void {
				render();
			}
		});
	}

	startRouter(store);
	render();
}

function getInitialData(): InitialData | undefined {
	const vaultElement = document.querySelector('[data-data="alva"]');

	if (!vaultElement) {
		return;
	}

	try {
		return JSON.parse(decodeURIComponent(vaultElement.textContent || '{}'));
	} catch (err) {
		return;
	}
}

// tslint:disable-next-line:no-any
function parse(data: string): any {
	try {
		return JSON.parse(data);
	} catch (err) {
		return;
	}
}

function refetch(name: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const candidate = document.querySelector(`script[data-script="${name}"]`);

		if (!candidate) {
			resolve(false);
		}

		const componentScript = candidate as HTMLScriptElement;
		const src = componentScript ? componentScript.getAttribute('src') : '';

		if (!src) {
			resolve(false);
		}

		const script = document.createElement('script');
		script.src = `${src}?reload=${Date.now()}`;
		script.dataset.script = name;

		script.onload = () => {
			if (componentScript && document.body.contains(componentScript)) {
				document.body.removeChild(componentScript);
			}
			resolve(true);
		};

		document.body.appendChild(script);
	});
}

function listen(
	store: PreviewStore,
	connection: WebSocket,
	handlers: { onReplacement(): void }
): void {
	const close = () => connection.close();

	connection.addEventListener('open', (...args) => {
		window.addEventListener('beforeunload', close);
	});

	connection.addEventListener('close', (...args) => {
		window.removeEventListener('beforeunload', close);
	});

	connection.addEventListener('message', (e: MessageEvent) => {
		const message = parse(e.data);
		const { type, id, payload } = message;

		switch (type) {
			case PreviewMessageType.Update: {
				Mobx.transaction(() => {
					if (Array.isArray(payload.patterns)) {
						store.patterns = payload.patterns;
					}

					if (Array.isArray(payload.patternProperties)) {
						store.patternProperties = payload.patternProperties;
					}

					Promise.all([refetch('renderer'), refetch('components')]).then(() => {
						handlers.onReplacement();
					});
				});
				break;
			}
			case PreviewMessageType.State: {
				if (window.location.hash && store.pageId !== payload.pageId) {
					window.location.hash = '';
				}

				Mobx.transaction(() => {
					if (Array.isArray(payload.elements)) {
						const els = payload.elements as Types.SerializedElement[];

						const newElements = differenceBy(els, store.elements, 'id');
						const removedElements = differenceBy(store.elements, els, 'id');
						const changedElements = els.filter(el => {
							const storeEl = store.elements.find(se => se.id === el.id);
							if (!storeEl) {
								return false;
							}
							return !Mobx.extras.deepEqual(storeEl, el);
						});

						removedElements.forEach(removedElement => {
							store.elements.splice(store.elements.indexOf(removedElement), 0);
						});

						newElements.forEach(newElement => {
							store.elements.splice(els.indexOf(newElement), 0, newElement);
						});

						changedElements.forEach(changedElement => {
							store.elements.splice(els.indexOf(changedElement), 0, changedElement);
						});
					}

					if (Array.isArray(payload.elementContents)) {
						store.elementContents = payload.elementContents;
					}

					if (typeof payload.pageId === 'string') {
						store.pageId = payload.pageId;
					}

					if (Array.isArray(payload.pages)) {
						store.pages = payload.pages;
					}

					if (Array.isArray(payload.patterns)) {
						store.patterns = payload.patterns;
					}

					if (Array.isArray(payload.patternProperties)) {
						store.patternProperties = payload.patternProperties;
					}
				});

				break;
			}
			case PreviewMessageType.ElementChange: {
				store.elementId = payload;
				break;
			}
			case PreviewMessageType.ContentRequest: {
				const rec = document.documentElement.getBoundingClientRect();

				connection.send(
					JSON.stringify({
						type: PreviewMessageType.ContentResponse,
						id,
						payload: {
							document: new XMLSerializer().serializeToString(document),
							location: window.location.href,
							height: rec.height,
							width: rec.width
						}
					})
				);

				break;
			}
			case PreviewMessageType.SketchExportRequest: {
				const sketchPage = HtmlSketchApp.nodeTreeToSketchPage(document.documentElement, {
					pageName: payload.pageName,
					addArtboard: true,
					artboardName: payload.artboardName,
					getGroupName: node =>
						node.getAttribute('data-sketch-name') || `(${node.nodeName.toLowerCase()})`,
					getRectangleName: () => 'background',
					skipSystemFonts: true
				});

				const page = sketchPage.toJSON();

				connection.send(
					JSON.stringify({
						type: PreviewMessageType.SketchExportResponse,
						id,
						payload: { page }
					})
				);
			}
		}
	});
}

function startRouter(store: PreviewStore): void {
	const performRouting = () => {
		const hash = window.location.hash ? window.location.hash.slice(1) : '';

		const previousPage = store.pages.find(page => page.id === store.pageId) || store.pages[0];

		const nextPage = hash.startsWith('page-')
			? store.pages[Number(hash.replace('page-', '')) - 1]
			: store.pages.find(page => page.id === hash);

		if (!nextPage) {
			return;
		}

		store.pageId = nextPage.id;

		if (document.title === '' || document.title === previousPage.name) {
			document.title = nextPage.name;
		}
	};

	performRouting();

	if (store.mode === PreviewDocumentMode.Static && !window.location.hash) {
		window.location.hash = '#page-1';
	}

	window.addEventListener('hashchange', performRouting);
}

// tslint:disable-next-line:no-any
function createComponentGetter(store: PreviewStore): (props: any, synthetics: any) => any {
	return (props, synthetics) => {
		const pattern = store.patterns.find(component => component.id === props.patternId);

		if (!pattern) {
			return;
		}

		switch (pattern.type) {
			case 'pattern':
				// tslint:disable-next-line:no-any
				const component = ((window as any).components || {})[pattern.id];

				if (!component) {
					throw new Error(
						`Could not find component with id "${pattern.id}" for pattern "${pattern.name}".`
					);
				}

				return component[pattern.exportName];
			case 'synthetic:page':
				return synthetics.page;
			case 'synthetic:placeholder':
				return synthetics.placeholder;
			case 'synthetic:text':
				return synthetics.text;
			case 'synthetic:box':
				return synthetics.box;
		}
	};
}

// tslint:disable:no-any
function createChildrenGetter(store: PreviewStore): (contents: any, render: any) => any {
	return (props, render) => {
		const slots = store.patterns.reduce((acc, component) => [...acc, ...component.slots], []);

		const [childContent] = props.contentIds
			.map(contentId => store.elementContents.find(e => e.id === contentId))
			.filter(content => typeof content !== 'undefined')
			.filter(content => {
				const slot = slots.find(s => s.id === content.slotId);
				if (!slot) {
					return false;
				}
				return slot.type === Types.SlotType.Children;
			});

		if (!childContent) {
			return [];
		}

		return childContent.elementIds
			.map(elementId => store.elements.find(e => e.id === elementId))
			.map(render);
	};
}

// tslint:disable:no-any
function createPropertiesGetter(
	store: PreviewStore
): (properties: Types.SerializedElementProperty[]) => any {
	return elementProperties =>
		elementProperties.reduce((acc, elementProperty) => {
			const patternProperty = store.patternProperties.find(
				p => p.id === elementProperty.patternPropertyId
			);

			if (!patternProperty) {
				return acc;
			}

			const { propertyName } = patternProperty;

			switch (patternProperty.type) {
				case 'enum': {
					const option = patternProperty.options.find(o => o.value === elementProperty.value);
					acc[propertyName] = option ? option.value : undefined;
					break;
				}
				default:
					acc[propertyName] = elementProperty.value;
			}

			return acc;
		}, {});
}

// tslint:disable:no-any
function createSlotGetter(store: PreviewStore): (contents: any, render: any) => any {
	return (props, render) => {
		const slots = store.patterns.reduce((acc, component) => [...acc, ...component.slots], []);

		const slotsContents = props.contentIds
			.map(contentId => store.elementContents.find(e => e.id === contentId))
			.filter(content => typeof content !== 'undefined')
			.filter(content => {
				const slot = slots.find(s => s.id === content.slotId);
				if (!slot) {
					return false;
				}
				return slot.type !== Types.SlotType.Children;
			});

		return slotsContents.reduce((acc, content) => {
			const slot = slots.find(s => s.id === content.slotId);

			if (slot) {
				acc[slot.propertyName] = content.elementIds
					.map(elementId => store.elements.find(e => e.id === elementId))
					.map(render);
			}

			return acc;
		}, {});
	};
}

main();
