import * as ConvertColor from 'color';
import { Color } from '../../components/colors';
import * as Electron from 'electron';
import * as electronIsDev from 'electron-is-dev';
import { HostWindowOptions, HostWindowVariant } from '../../types';
import * as Fs from 'fs';
import * as Path from 'path';

export async function createWindow(options: HostWindowOptions): Promise<Electron.BrowserWindow> {
	const windowOptions = getWindowVariant(options.variant);
	const win = new Electron.BrowserWindow(windowOptions);

	if (options.variant === HostWindowVariant.Normal) {
		win.maximize();
	}

	win.loadURL(options.address);

	win.webContents.on('new-window', e => e.preventDefault());

	// Install development tools in dev mode
	if (electronIsDev) {
		const {
			REACT_DEVELOPER_TOOLS,
			REACT_PERF,
			MOBX_DEVTOOLS
		} = require('electron-devtools-installer');
		const installDevTool = require('electron-devtools-installer').default;

		await installDevTool(REACT_DEVELOPER_TOOLS);
		await installDevTool(REACT_PERF);
		await installDevTool(MOBX_DEVTOOLS);
	}

	return win;
}

function getPreloadScript(): string | undefined {
	return [
		Path.resolve(__dirname, '..', 'scripts', 'createWindowPreload.js'), //  built via ncc
		Path.resolve(__dirname, '..', '..', 'scripts', 'createWindowPreload.js') // other envs
	].find(candidate => Fs.existsSync(candidate));
}

function getWindowVariant(variant: HostWindowVariant): Electron.BrowserWindowConstructorOptions {
	const shared: Partial<Electron.BrowserWindowConstructorOptions> = {
		titleBarStyle: 'hiddenInset',
		title: 'Alva',
		webPreferences: {
			sandbox: true,
			nodeIntegration: false,
			preload: getPreloadScript(),
			contextIsolation: true
		}
	};

	switch (variant) {
		case HostWindowVariant.Splashscreen:
			return {
				height: 500,
				width: 820,
				backgroundColor: ConvertColor(Color.White)
					.hex()
					.toString(),
				resizable: false,
				minimizable: false,
				maximizable: false,
				fullscreenable: false,
				center: true,
				...shared
			};
		case HostWindowVariant.Normal:
		default:
			return {
				minWidth: 780,
				minHeight: 380,
				backgroundColor: ConvertColor(Color.Grey97)
					.hex()
					.toString(),
				...shared
			};
	}
}
