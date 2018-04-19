import { WebviewTag } from 'electron';
import { Exporter, ExportResult } from './exporter';

export class PdfExporter extends Exporter {
	// tslint:disable-next-line promise-function-async
	public createExport(webview: WebviewTag): Promise<ExportResult> {
		return new Promise(resolve => {
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
				}
			);
		});
	}
}
