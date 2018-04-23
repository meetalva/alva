import * as HtmlSketchApp from '@thereincarnator/html-sketchapp';
import { ipcRenderer, WebviewTag } from 'electron';
import { Exporter, ExportResult } from './exporter';
import { Page } from '../store/page/page';
import { Store } from '../store/store';
import * as uuid from 'uuid';

type Message = SuccessMessage | ErrorMessage;

interface SuccessMessage {
	contents: string;
	id: string;
}

interface ErrorMessage {
	error: Error;
	id: string;
}

export class SketchExporter extends Exporter {
	private id: string;

	public constructor() {
		super();
		this.id = uuid.v4();
	}

	public static createSketchExport(): string {
		const element = document.querySelector('#preview > div > div:nth-child(1)') as HTMLElement;

		const page = Store.getInstance().getCurrentPage() as Page;
		const pageName = page.getName();
		const projectName = page.getName();

		const sketchPage = HtmlSketchApp.nodeTreeToSketchPage(element, {
			pageName: projectName,
			addArtboard: true,
			artboardName: pageName,
			getGroupName: node =>
				node.getAttribute('data-sketch-name') || `(${node.nodeName.toLowerCase()})`,
			getRectangleName: () => 'background',
			skipSystemFonts: true
		});

		return JSON.stringify(sketchPage.toJSON(), null, '\t');
	}

	public async createExport(webview: WebviewTag): Promise<ExportResult> {
		return new Promise<ExportResult>((resolve, reject) => {
			// tslint:disable-next-line no-any
			const onMessage = (_: Event, payload: any) => {
				if (!this.isMessage(payload)) {
					return;
				}

				if (payload.id !== this.id) {
					return;
				}

				ipcRenderer.removeListener('export-as-sketch-done', onMessage);

				if (this.isError(payload)) {
					resolve({ error: payload.error });
				} else {
					this.contents = Buffer.from(payload.contents);
					resolve({ result: this.contents });
				}
			};

			ipcRenderer.on('export-as-sketch-done', onMessage);
			webview.send('export-as-sketch', this.id);
		});
	}

	// tslint:disable-next-line no-any
	private isError(message: any): message is ErrorMessage {
		if (!this.isMessage(message)) {
			return false;
		}

		if (!message.hasOwnProperty('error')) {
			return false;
		}

		return true;
	}

	// tslint:disable-next-line no-any
	private isMessage(message: any): message is Message {
		if (typeof message !== 'object') {
			return false;
		}

		if (!message.hasOwnProperty('id')) {
			return false;
		}

		if (!message.hasOwnProperty('contents') && !message.hasOwnProperty('error')) {
			return false;
		}

		return true;
	}
}
