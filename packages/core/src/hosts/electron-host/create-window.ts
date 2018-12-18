import * as ConvertColor from 'color';
import { Color } from '../../components/colors';
import * as Electron from 'electron';
import * as electronIsDev from 'electron-is-dev';

export async function createWindow(address: string): Promise<Electron.BrowserWindow> {
	const win = new Electron.BrowserWindow({
		minWidth: 780,
		minHeight: 380,
		titleBarStyle: 'hiddenInset',
		backgroundColor: ConvertColor(Color.Grey97)
			.hex()
			.toString(),
		title: 'Alva',
		webPreferences: {
			nodeIntegration: false,
			preload: require.resolve('./create-window-preload')
		}
	});

	win.maximize();
	win.loadURL(address);

	win.webContents.on('new-window', e => {
		e.preventDefault();
	});

	// Install development tools in dev mode
	if (electronIsDev) {
		require('devtron').install();

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
