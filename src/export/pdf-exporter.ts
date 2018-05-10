import { Exporter, ExportResult } from './exporter';
import { ServerMessageType } from '../message';
import * as Sender from '../message/sender';
import { ViewStore } from '../store';
import * as Url from 'url';
import * as uuid from 'uuid';

export class PdfExporter extends Exporter {
	public async createExport(): Promise<ExportResult> {
		return new Promise<ExportResult>(resolve => {
			const id = uuid.v4();
			const initial = 'data:text/html;<html></html>';

			const webview = document.createElement('webview');
			webview.style.position = 'fixed';
			webview.style.top = '100vh';
			webview.src = initial;
			webview.webpreferences = 'useContentSize=yes, javascript=no';
			document.body.insertBefore(webview, document.body.firstChild);

			const store = ViewStore.getInstance();
			let started;

			// (1) Request HTML contents from preview
			const start = () => {
				Sender.send({
					payload: undefined,
					type: ServerMessageType.ContentRequest,
					id
				});
			};

			// (2) Receive HTML response from preview and load into webview
			// tslint:disable-next-line:no-any
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

				webview.loadURL(
					`data:text/html;charset=utf-8,${encodeURIComponent(payload.document)}`,
					{
						baseURLForDataURL: payload.location
					}
				);
			};

			// (3) Wait for webview to be ready and capture the page
			const createPdf = () => {
				if (started !== id) {
					return;
				}

				webview.printToPDF(
					{
						marginsType: 1,
						pageSize: 'A4',
						printBackground: true,
						printSelectionOnly: false,
						landscape: false
					},
					(error: Error, data: Buffer) => {
						if (error) {
							resolve({ error });
							return;
						}

						this.contents = data;
						resolve({ result: this.contents });

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
				createPdf();
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
}
