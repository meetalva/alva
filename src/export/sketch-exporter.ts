import * as uuid from 'uuid';

import * as Sender from '../message/client';
import { Exporter } from './exporter';
import { ServerMessageType } from '../message';
import { Page, ViewStore } from '../store';

export class SketchExporter extends Exporter {
	public execute(path: string): void {
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
				// Todo: Implement error message
				return;
			}

			this.contents = Buffer.from(JSON.stringify(message.payload.page, null, '\t'));

			Sender.send({
				id: uuid.v4(),
				type: ServerMessageType.ExportSketch,
				payload: { path, content: this.contents }
			});
			return;
		};

		Sender.receive(receive);
		start();
	}
}
