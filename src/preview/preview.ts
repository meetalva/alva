import * as HtmlSketchApp from '@brainly/html-sketchapp';
import { App } from './app';
import { PreviewMessageType } from '../message';
import { Page } from './store/page';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as SmoothscrollPolyfill from 'smoothscroll-polyfill';
import { Store } from './store/store';

interface InitialData {
	data: {
		currentPageId: string;
		pages: Page[];
	};
	mode: 'static' | 'live';
}

const store = Store.getInstance();

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

async function refetch(name: string): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
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

function render(): void {
	ReactDom.render(React.createElement(App), document.getElementById('preview'));
}

function listen(): void {
	store.connection = new WebSocket(`ws://${window.location.host}`);
	const close = () => store.connection.close();

	store.connection.addEventListener('open', (...args) => {
		window.addEventListener('beforeunload', close);
	});

	store.connection.addEventListener('close', (...args) => {
		window.removeEventListener('beforeunload', close);
	});

	store.connection.addEventListener('message', (e: MessageEvent) => {
		const message = parse(e.data);
		const { type, id, payload } = message;

		// TODO: Do type refinements on message here
		switch (type) {
			case PreviewMessageType.Reload: {
				window.location.reload();
				break;
			}

			case PreviewMessageType.Update: {
				Promise.all([refetch('components')])
					.then(() => {
						render();
					})
					.catch(error => {
						console.error('Failed to refetch components');
						console.error(error);
					});
				break;
			}

			case PreviewMessageType.State: {
				store.currentPageId = payload.currentPageId;
				store.pages = payload.pages;

				break;
			}

			case PreviewMessageType.SelectElement: {
				store.selectedElementId = payload;
				break;
			}

			case PreviewMessageType.ContentRequest: {
				const rec = document.documentElement.getBoundingClientRect();

				store.connection.send(
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

				store.connection.send(
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

function startRouter(): void {
	const performRouting = () => {
		const hash = window.location.hash ? window.location.hash.slice(1) : '';

		if (hash.startsWith('page-')) {
			const index = Number(hash.replace('page-', ''));
			const currentPage = store.pages[index - 1] || store.pages[0];
			store.currentPageId = currentPage.id;
		} else {
			const currentPage = store.pages.find(page => page.id === hash) || store.pages[0];
			store.currentPageId = currentPage.id;
		}
	};

	performRouting();

	if (!window.location.hash) {
		window.location.hash = '#page-1';
	}

	window.addEventListener('hashchange', performRouting);
}

SmoothscrollPolyfill.polyfill();

const initialData = getInitialData();
store.setFromData(initialData ? initialData.data : undefined);

if (!initialData || initialData.mode === 'live') {
	listen();
} else {
	startRouter();
}

render();
