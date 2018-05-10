import * as Sender from '../message/client';
import { Exporter, ExportResult } from './exporter';
import { ServerMessageType } from '../message';
import { Page, ViewStore } from '../store';
import * as uuid from 'uuid';

export class SketchExporter extends Exporter {
	public async createExport(): Promise<ExportResult> {
		return new Promise<ExportResult>((resolve, reject) => {
			const id = uuid.v4();
			const page = ViewStore.getInstance().getCurrentPage() as Page;
			const artboardName = page.getName();
			const pageName = page.getName();

			// (1) request asketch.json from preview
			const start = () => {
				Sender.send({
					type: ServerMessageType.SketchExportRequest,
					id,
					payload: {
						artboardName,
						pageName
					}
				});
			};

			const receive = message => {
				if (message.type !== ServerMessageType.SketchExportResponse || message.id !== id) {
					return;
				}

				this.contents = Buffer.from(JSON.stringify(message.payload.page, null, '\t'));
				resolve({ result: this.contents });
				return;
			};

			Sender.receive(receive);
			start();
		});
	}
}
