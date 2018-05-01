import * as HtmlSketchApp from '@brainly/html-sketchapp';
import { getComponent } from './get-component';
import { HighlightArea } from './highlight-area';
import { PreviewMessageType } from '../message';
import * as MobX from 'mobx';
import * as SmoothscrollPolyfill from 'smoothscroll-polyfill';

// TODO: Produces a deprecation warning, find a way
// to dedupe MobX when upgrading to 4.x
MobX.extras.shareGlobalState();

export interface PageElement {
	contents: {
		[propName: string]: PageElement[];
	};
	exportName: string;
	name: string;
	pattern: string;
	properties: {
		// tslint:disable-next-line:no-any
		[propName: string]: any;
	};
	uuid: string;
}

export interface Page {
	id: string;
	root: PageElement;
}

export class PreviewStore {
	@MobX.observable public elementId: string = '';
	@MobX.observable public page?: Page;
}

function main(): void {
	SmoothscrollPolyfill.polyfill();

	const store = new PreviewStore();
	const highlight = new HighlightArea();

	const connection = new WebSocket(`ws://${window.location.host}`);
	const close = () => connection.close();

	const render = () => {
		// tslint:disable-next-line:no-any
		(window as any).renderer.render({
			getComponent,
			highlight,
			store
		});
	};

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
					render();
				});
				break;
			}
			case PreviewMessageType.State: {
				store.page = payload.page;
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

	render();
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

main();
