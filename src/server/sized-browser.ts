import * as Electron from 'electron';

export interface SizedBrowserInit {
	url: string;
	width?: number;
	height?: number;
}

export function sizedBrowser(init: SizedBrowserInit): Promise<Electron.BrowserWindow> {
	return new Promise((resolve, reject) => {
		const browser = new Electron.BrowserWindow({
			useContentSize: true,
			show: false,
			webPreferences: {
				defaultEncoding: 'utf-8',
				nodeIntegration: false,
				nodeIntegrationInWorker: false,
				contextIsolation: true
			}
		});

		browser.loadURL(init.url);

		browser.webContents.once('did-get-response-details', (e, _, __, ___, code) => {
			if (code !== 200) {
				return reject(new Error(`Request for ${init.url} failed with code ${code}`));
			}

			browser.once('ready-to-show', async () => {
				const { width: documentWidth, height: documentHeight } = await getDocumentSize(browser);

				const width = init.width ? init.width : documentWidth;
				const height = init.height ? init.height : documentHeight;

				browser.setContentSize(width, height);
				await delay(100);
				resolve(browser);
			});
		});
	});
}

async function getDocumentSize(
	browser: Electron.BrowserWindow
): Promise<{ width: number; height: number }> {
	const result = await browser.webContents.executeJavaScript('window.rpc.getDocumentSize()');

	if (typeof result.width !== 'number' || typeof result.height !== 'number') {
		throw new Error(`Could not determine document size: ${JSON.stringify(result)}`);
	}

	return {
		width: result.width,
		height: result.height
	};
}

function delay(duration: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, duration));
}
