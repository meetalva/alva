import { remote, WebviewTag } from 'electron';
import * as FileExtraUtils from 'fs-extra';

export class PngExporter {
	public static exportToPng(path: string, webview: WebviewTag): void {
		// code that gets executed inside the webview to get
		// the actual size of the preview body
		const code = `
			bodyTag = document.querySelector('body');
			({
				pageHeight: bodyTag.getBoundingClientRect().height,
				pageWidth: bodyTag.getBoundingClientRect().width
			});
		`;

		webview.executeJavaScript(code, false, webviewSize => {
			// set the height of the webview tag to the preview body height
			// This is needed because capturePage can not capture anything that renders
			// outside the webview area (https://github.com/electron/electron/issues/9845)
			webview.style.height = webviewSize.pageHeight;

			// Delay the page capture to make sure that the style height changes are done.
			// This is only needed because of the change in height in the above line
			setTimeout(() => {
				const scaleFactor = remote.screen.getPrimaryDisplay().scaleFactor;
				webview.capturePage(
					{
						x: 0,
						y: 0,
						// round the numbers to remove possible floating numbers
						// also multiply by scaleFactor for devices with higher pixel ratio:
						// https://github.com/electron/electron/issues/8314
						width: Math.round(webviewSize.pageWidth * scaleFactor),
						height: Math.round(webviewSize.pageHeight * scaleFactor)
					},
					capture => {
						const pngBuffer: Buffer = capture.toPNG();
						FileExtraUtils.writeFileSync(path, pngBuffer);

						// reset the webview height
						webview.style.height = '100%';
					}
				);
			}, 100);
		});
	}
}
