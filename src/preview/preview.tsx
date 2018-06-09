import * as HtmlSketchApp from '@brainly/html-sketchapp';
import { differenceBy } from 'lodash';
import { PreviewMessageType } from '../message';
import * as Mobx from 'mobx';
import { PreviewDocumentMode } from './preview-document';
import * as SmoothscrollPolyfill from 'smoothscroll-polyfill';
import * as Types from '../types';
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

const PRESENTATIONAL_KEYS = [
	'open',
	'selected',
	'highlighted',
	'placeholderHighlighted',
	'dragged',
	'name'
];

export class PreviewStore implements Types.RenderPreviewStore {
	private connection?: WebSocket;

	@Mobx.observable public elementActions: Types.SerializedElementAction[] = [];
	@Mobx.observable public elementContents: Types.SerializedElementContent[] = [];
	@Mobx.observable public elements: Types.SerializedElement[] = [];
	@Mobx.observable public highlightedElementId: string = '';
	@Mobx.observable public metaDown: boolean = false;
	@Mobx.observable public mode: PreviewDocumentMode = PreviewDocumentMode.Live;
	@Mobx.observable public pageId: string = '';
	@Mobx.observable public pages: Types.SerializedPage[] = [];
	@Mobx.observable public patternProperties: Types.SerializedPatternProperty[] = [];
	@Mobx.observable public patterns: Types.SerializedPattern[] = [];
	@Mobx.observable public selectedElementId: string = '';
	@Mobx.observable public userStore: Types.SerializedUserStore;

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

		if (payload.userStore) {
			store.userStore = payload.userStore;
		}

		if (payload.elementActions) {
			store.elementActions = payload.elementActions;
		}

		return store;
	}

	public setConnection(connection: WebSocket): void {
		this.connection = connection;
	}

	public navigateTo(pageId: string): void {
		if (!this.userStore) {
			return;
		}

		if (!this.metaDown && this.mode === PreviewDocumentMode.Live) {
			return;
		}

		const page = this.pages.find(p => p.id === pageId);

		if (!page) {
			return;
		}

		this.pages.filter(p => p.active && p.id !== pageId).forEach(p => p.active === false);

		page.active = true;
		this.pageId = page.id;

		if (!this.connection) {
			return;
		}

		this.connection.send(
			JSON.stringify({
				type: PreviewMessageType.ChangeActivePage,
				id: uuid.v4(),
				payload: {
					id: pageId,
					metaDown: this.metaDown
				}
			})
		);
	}
}

function main(): void {
	SmoothscrollPolyfill.polyfill();

	const initialData = getInitialData();
	const store = PreviewStore.from(initialData ? initialData.data : undefined);

	const connection =
		store.mode === PreviewDocumentMode.Live
			? new WebSocket(`ws://${window.location.host}`)
			: undefined;

	if (connection) {
		connection.addEventListener('open', () => {
			store.setConnection(connection);
		});
	}

	window.addEventListener('keydown', e => {
		store.metaDown = e.metaKey;
	});

	window.addEventListener('keyup', e => {
		store.metaDown = false;
	});

	const onElementClick = (e: MouseEvent, payload) => {
		if (!connection) {
			return;
		}

		e.preventDefault();

		if (e.metaKey) {
			return connection.send(
				JSON.stringify({
					type: PreviewMessageType.ClickElement,
					id: uuid.v4(),
					payload
				})
			);
		}
	};

	const onElementSelect = (e: MouseEvent, payload) => {
		if (!connection) {
			return;
		}

		if (e.metaKey) {
			return;
		}

		e.preventDefault();

		store.selectedElementId = payload.id;

		connection.send(
			JSON.stringify({
				type: PreviewMessageType.SelectElement,
				id: uuid.v4(),
				payload: {
					id: payload.id,
					metaDown: store.metaDown
				}
			})
		);
	};

	const onOutsideClick = e => {
		if (!connection) {
			return;
		}

		e.preventDefault();

		store.selectedElementId = '';

		connection.send(
			JSON.stringify({
				type: PreviewMessageType.UnselectElement,
				id: uuid.v4()
			})
		);
	};

	const onElementMouseOver = (e, payload) => {
		if (store.mode === 'static') {
			return;
		}

		const previous = store.elements.filter(el => el.highlighted && el.id !== payload.id);
		previous.forEach(p => (p.highlighted = false));

		const element = store.elements.find(el => el.id === payload.id);

		if (element && element.role !== 'root') {
			element.highlighted = true;
			store.highlightedElementId = element.id;
		} else {
			store.highlightedElementId = '';
		}

		if (!connection) {
			return;
		}

		connection.send(
			JSON.stringify({
				type: PreviewMessageType.HighlightElement,
				id: uuid.v4(),
				payload: {
					id: element ? element.id : undefined,
					metaDown: store.metaDown
				}
			})
		);
	};

	const render = () => {
		renderer.render(
			{
				getChildren: createChildrenGetter(store),
				getComponent: createComponentGetter(store),
				getProperties: createPropertiesGetter(store),
				getSlots: createSlotGetter(store),
				onElementClick,
				onElementMouseOver,
				onElementSelect,
				onOutsideClick,
				store
			},
			document.getElementById('preview') as HTMLElement
		);
	};

	if (connection) {
		listen(store, connection, {
			onReplacement(): void {
				render();
			}
		});
	}

	// startRouter(store);
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
				Mobx.transaction(() => {
					if (Array.isArray(payload.elements)) {
						const els = payload.elements as Types.SerializedElement[];

						const newElements = differenceBy(els, store.elements, 'id');
						const removedElements = differenceBy(store.elements, els, 'id');

						const changedElements = els.filter(el => {
							if (newElements.includes(el)) {
								return;
							}

							if (removedElements.includes(el)) {
								return;
							}

							const storeEl = store.elements.find(se => se.id === el.id);

							if (!storeEl) {
								return false;
							}

							const changedKeys = diff(storeEl, el).filter(
								c => !PRESENTATIONAL_KEYS.includes(c)
							);

							if (changedKeys.length === 0) {
								return false;
							}

							return !Mobx.extras.deepEqual(storeEl, el);
						});

						removedElements.forEach(removedElement => {
							store.elements.splice(store.elements.indexOf(removedElement), 1);
						});

						newElements.forEach(newElement => {
							store.elements.splice(els.indexOf(newElement), 0, newElement);
						});

						changedElements.forEach(changedElement => {
							store.elements.splice(els.indexOf(changedElement), 1, changedElement);
						});
					}

					if (Array.isArray(payload.elementContents)) {
						store.elementContents = payload.elementContents;
					}

					if (Array.isArray(payload.elementActions)) {
						store.elementActions = payload.elementActions;
					}

					if (typeof payload.pageId === 'string') {
						store.pageId = payload.pageId;
					}

					if (payload.userStore) {
						store.userStore = payload.userStore;
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
			case PreviewMessageType.ChangeHighlightedElement: {
				store.highlightedElementId = payload;
				break;
			}
			case PreviewMessageType.ChangeSelectedElement: {
				store.selectedElementId = payload;
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
			case 'synthetic:image':
				return synthetics.image;
			case 'synthetic:text':
				return synthetics.text;
			case 'synthetic:box':
				return synthetics.box;
			case 'synthetic:link':
				return synthetics.link;
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
			.filter(c => typeof c !== 'undefined')
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
				case 'EventHandler': {
					const elementAction = store.elementActions.find(a => a.id === elementProperty.value);

					if (!elementAction) {
						return acc;
					}

					const storeAction = store.userStore.actions.find(
						a => a.id === elementAction.storeActionId
					);
					const storeProperty = store.userStore.properties.find(
						p => p.id === elementAction.storePropertyId
					);

					if (!storeAction || !storeProperty) {
						return acc;
					}

					switch (storeAction.type) {
						case 'set':
							acc[propertyName] = e => {
								e.preventDefault();

								if (storeProperty.type === 'page') {
									storeProperty.payload = elementAction.payload;
									store.navigateTo(elementAction.payload);
									return;
								}

								storeProperty.payload = elementAction.payload;
							};
							break;
						case 'noop':
							// tslint:disable-next-line:no-empty
							acc[propertyName] = () => {};
					}
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

function diff(object: { [key: string]: any }, base: { [key: string]: any }): string[] {
	return Object.entries(object)
		.filter(([k, v]) => !Mobx.extras.deepEqual(base[k], v))
		.map(([k]) => k);
}

main();
