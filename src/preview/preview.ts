import * as HtmlSketchApp from '@brainly/html-sketchapp';
import { App } from './app';
import { PreviewMessageType } from '../message';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as SmoothscrollPolyfill from 'smoothscroll-polyfill';
import { Store } from './store/store';

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
	ReactDom.render(React.createElement(App, { connection }), document.getElementById('preview'));
}

SmoothscrollPolyfill.polyfill();

const store = Store.getInstance();

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
			store.page = payload.page;
			break;
		}

		case PreviewMessageType.SelectElement: {
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

render();
