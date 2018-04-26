import { checkForUpdates } from './auto-updater';
import { colors } from '../lsg/patterns/colors';
import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as PathUtils from 'path';
import * as url from 'url';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | undefined;

function createWindow(): void {
	const { width = 1280, height = 800 } = screen.getPrimaryDisplay().workAreaSize;

	// Create the browser window.
	win = new BrowserWindow({
		width,
		height,
		minWidth: 780,
		minHeight: 380,
		titleBarStyle: 'hiddenInset',
		backgroundColor: colors.grey97.toString('hex'),
		title: 'Alva'
	});

	// and load the index.html of the app.
	win.loadURL(
		url.format({
			pathname: PathUtils.join(__dirname, 'renderer', 'app.html'),
			protocol: 'file:',
			slashes: true
		})
	);

	// Open the DevTools.
	// win.webContents.openDevTools();

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = undefined;
	});

	// Disable navigation on the host window object, triggered by system drag and drop
	win.webContents.on('will-navigate', e => {
		e.preventDefault();
	});

	let devToolsInstaller;
	try {
		devToolsInstaller = require('electron-devtools-installer');
	} catch (error) {
		// Ignored
	}

	if (devToolsInstaller) {
		devToolsInstaller
			.default(devToolsInstaller.REACT_DEVELOPER_TOOLS)
			// tslint:disable-next-line:no-any
			.catch((err: any) => {
				console.warn('An error occurred: ', err);
			});
	}
	checkForUpdates(win);
}

const log = require('electron-log');
log.info('App starting...');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (!win) {
		createWindow();
	}
});

ipcMain.on('request-check-for-updates', () => {
	if (win) {
		checkForUpdates(win, true);
	}
});

ipcMain.on('preview-ready', () => {
	BrowserWindow.getAllWindows().forEach(window => {
		window.webContents.send('preview-ready');
	});
});

// tslint:disable-next-line:no-any
ipcMain.on('export-as-sketch-done', (_: Event, payload: any) => {
	BrowserWindow.getAllWindows().forEach(window => {
		window.webContents.send('export-as-sketch-done', payload);
	});
});
