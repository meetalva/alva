import * as ConvertColor from 'color';
import { checkForUpdates } from './auto-updater';
import { Color } from '../components/colors';
import * as Electron from 'electron';
import * as electronIsDev from 'electron-is-dev';

export interface ElectronWindowContext {
	window: undefined | Electron.BrowserWindow;
}

const CONTEXT: ElectronWindowContext = {
	window: undefined
};

export async function createWindow(ctx: { port: number }): Promise<ElectronWindowContext> {
	// Create the browser window.
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
			preload: require.resolve('./preload')
		}
	});

	win.maximize();

	// and load the index.html of the app.
	win.loadURL(`http://localhost:${ctx.port}/`);

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		CONTEXT.window = undefined;
	});

	// Disable navigation on the host window object, triggered by system drag and drop
	win.webContents.on('will-navigate', e => {
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

	checkForUpdates(win);

	CONTEXT.window = win;
	return CONTEXT;
}
