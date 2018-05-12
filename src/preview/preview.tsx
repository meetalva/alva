import * as HtmlSketchApp from '@brainly/html-sketchapp';
import { HighlightArea } from './highlight-area';
import { PreviewMessageType } from '../message';
import * as MobX from 'mobx';
import { PreviewDocumentMode } from './preview-document';
import * as SmoothscrollPolyfill from 'smoothscroll-polyfill';
import * as Types from '../store/types';

// TODO: Produces a deprecation warning, find a way
// to dedupe MobX when upgrading to 4.x
MobX.extras.shareGlobalState();

interface InitialData {
	data: {
		pageId: string;
		pages: Types.SerializedPage[];
	};
	mode: 'static' | 'live';
}

export class PreviewStore {
	@MobX.observable public components: Types.SerializedPattern[] = [];
	@MobX.observable public elementId: string = '';
	@MobX.observable public mode: PreviewDocumentMode = PreviewDocumentMode.Live;
	@MobX.observable public pageId: string = '';
	@MobX.observable public pages: Types.SerializedPage[] = [];

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

		if (payload.pageId) {
			store.pageId = payload.pageId;
		}

		if (payload.pages) {
			store.pages = payload.pages;
		}

		return store;
	}
}

function main(): void {
	SmoothscrollPolyfill.polyfill();

	const initialData = getInitialData();
	const store = PreviewStore.from(initialData ? initialData.data : undefined);

	const highlight = new HighlightArea();

	const render = () => {
		// tslint:disable-next-line:no-any
		(window as any).renderer.render({
			// tslint:disable-next-line:no-any
			getComponent: createComponentGetter(store),
			getProperties: createPropertiesGetter(store),
			getSlots: createSlotGetter(store),
			highlight,
			store
		});
	};

	if (store.mode === PreviewDocumentMode.Live) {
		listen(store, {
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

function listen(store: PreviewStore, handlers: { onReplacement(): void }): void {
	const connection = new WebSocket(`ws://${window.location.host}`);
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

		// TODO: Do type refinements on message here
		switch (type) {
			case PreviewMessageType.Reload: {
				window.location.reload();
				break;
			}
			case PreviewMessageType.Update: {
				Promise.all([refetch('renderer'), refetch('components')]).then(() => {
					handlers.onReplacement();
				});
				break;
			}
			case PreviewMessageType.State: {
				if (window.location.hash && store.pageId !== payload.pageId) {
					window.location.hash = '';
				}

				if (typeof payload.pageId === 'string') {
					store.pageId = payload.pageId;
				}

				if (Array.isArray(payload.pages)) {
					store.pages = payload.pages;
				}

				if (Array.isArray(payload.components)) {
					store.components = payload.components;
				}

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
		const pattern = store.components.find(component => component.id === props.pattern);

		if (!pattern) {
			return;
		}

		switch (pattern.type) {
			case 'pattern':
			// TODO: Restore window[pattern] access here
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
function createPropertiesGetter(
	store: PreviewStore
): (properties: Types.SerializedElementProperty[]) => any {
	return properties =>
		properties.reduce((acc, property) => {
			const { patternProperty } = property;
			const { propertyName } = patternProperty;

			switch (patternProperty.type) {
				case 'enum': {
					const option = patternProperty.options.find(o => o.id === property.value);
					acc[propertyName] = option ? option.value : undefined;
					break;
				}
				default:
					acc[propertyName] = property.value;
			}

			return acc;
		}, {});
}

// tslint:disable:no-any
function createSlotGetter(
	store: PreviewStore
): (contents: Types.SerializedPageElementContent[], render: any) => any {
	return (contents, render) => {
		const slots = store.components.reduce((acc, component) => [...acc, ...component.slots], []);

		return contents.reduce((acc, content) => {
			const slot = slots.find(s => s.id === content.slotId);

			if (slot) {
				acc[slot.propertyName] = content.elements.map(render);
			}

			return acc;
		}, {});
	};
}

main();
