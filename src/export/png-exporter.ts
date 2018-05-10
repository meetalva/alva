import { ipcRenderer, remote } from 'electron';
import { Exporter, ExportResult } from './exporter';
import { ServerMessageType } from '../message';
import { ViewStore } from '../store';
import * as Url from 'url';
import * as uuid from 'uuid';

export class PngExporter extends Exporter {
	public async createExport(): Promise<ExportResult> {
		try {
			this.contents = await this.createPngExport();
			return { result: this.contents };
		} catch (error) {
			return { error };
		}
	}

	private async createPngExport(): Promise<Buffer> {
		return new Promise<Buffer>(resolve => {
			const id = uuid.v4();
			const initial = 'data:text/html;<html></html>';
			const webview = document.createElement('webview');
			webview.style.position = 'fixed';
			webview.style.top = '100vh';
			webview.src = initial;
			webview.webpreferences = 'useContentSize=yes, javascript=no';
			document.body.insertBefore(webview, document.body.firstChild);

			const store = ViewStore.getInstance();
			const scaleFactor = remote.screen.getPrimaryDisplay().scaleFactor;

			let config;
			let started;

			// (1) Request HTML contents from preview
			const start = () => {
				ipcRenderer.send('message', {
					type: ServerMessageType.ContentRequest,
					id
				});
			};

			// (2) Receive HTML response from preview and load into webview
			// tslint:disable-next-line:no-any
			const receive = (_, message: any) => {
				if (message.type !== ServerMessageType.ContentResponse || message.id !== id) {
					return;
				}

				const payload = message.payload;
				const parsed = Url.parse(payload.location);

				if (parsed.host !== `localhost:${store.getServerPort()}`) {
					return;
				}

				webview.style.width = `${payload.width}px`;
				webview.style.height = `${payload.height}px`;

				config = payload;

				webview.loadURL(
					`data:text/html;charset=utf-8,${encodeURIComponent(payload.document)}`,
					{
						baseURLForDataURL: payload.location
					}
				);
			};

			// (3) Wait for webview to be ready and capture the page
			const createPng = () => {
				if (!config) {
					return;
				}

				webview.capturePage(
					{
						x: 0,
						y: 0,
						// round the numbers to remove possible floating numbers
						// also multiply by scaleFactor for devices with higher pixel ratio:
						// https://github.com/electron/electron/issues/8314
						width: Math.round(config.width * scaleFactor),
						height: Math.round(config.height * scaleFactor)
					},
					capture => {
						const pngBuffer: Buffer = capture.toPNG();
						resolve(pngBuffer);

						setTimeout(() => {
							document.body.removeChild(webview);
						});
					}
				);
			};

			webview.addEventListener('did-finish-load', () => {
				if (webview.src === initial) {
					return;
				}
				createPng();
			});

			ipcRenderer.on('message', receive);

			webview.addEventListener('dom-ready', () => {
				if (started === id) {
					return;
				}

				started = id;
				start();
			});
		});
	}
}
