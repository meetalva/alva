import { WebviewTag } from 'electron';
import * as FileExtraUtils from 'fs-extra';

export class PdfExporter {
	public static exportToPdf(path: string, webview: WebviewTag): void {
		webview.printToPDF(
			{
				marginsType: 1,
				pageSize: 'A4',
				printBackground: true,
				printSelectionOnly: false,
				landscape: false
			},
			(error, pdfBuffer) => {
				FileExtraUtils.writeFileSync(path, pdfBuffer);
			}
		);
	}
}
