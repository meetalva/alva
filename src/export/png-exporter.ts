import { remote } from 'electron';
import * as Url from 'url';
import * as uuid from 'uuid';

import * as Sender from '../message/client';
import { ServerMessageType } from '../message';
import { ViewStore } from '../store';
import * as Types from '../model/types';

export class PngExporter implements Types.Exporter {
	public contents: Buffer;

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
				Sender.send({
					type: ServerMessageType.ContentRequest,
					id,
					payload: undefined
				});
			};

			// (2) Receive HTML response from preview and load into webview
			const receive = message => {
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
			const createPng = (isSecondTry?: boolean) => {
				if (!config) {
					return;
				}

				// because of a bug in electron the second capture will only be triggered if we set the focus on this webview
				webview.focus();

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
						const captureSize = capture.getSize();
						if (captureSize.width === 0 && captureSize.height === 0 && !isSecondTry) {
							// If the captured image is of size 0 try the capture again
							createPng(true);
							return;
						}

						// resize the capture to the original screen size
						const resizedCapture = capture.resize({
							width: capture.getSize().width / scaleFactor
						});

						const pngBuffer: Buffer = resizedCapture.toPNG();
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

			Sender.receive(receive);

			webview.addEventListener('dom-ready', () => {
				if (started === id) {
					return;
				}

				started = id;
				start();
			});
		});
	}

	public async execute(path: string): Promise<void> {
		try {
			this.contents = await this.createPngExport();

			Sender.send({
				id: uuid.v4(),
				type: ServerMessageType.ExportPNG,
				payload: { path, content: this.contents }
			});
		} catch (error) {
			// Todo: Implement error message
			return;
		}
	}
}
