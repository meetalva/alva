import { app, BrowserWindow } from 'electron';
import * as devToolsInstaller from 'electron-devtools-installer';
import { autoUpdater } from 'electron-updater';
import * as PathUtils from 'path';
import * as url from 'url';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | undefined;

function createWindow(): void {
	// Create the browser window.
	win = new BrowserWindow({
		width: 1280,
		height: 800,
		titleBarStyle: 'hiddenInset',
		title: 'Alva'
	});

	// and load the index.html of the app.
	win.loadURL(
		url.format({
			pathname: PathUtils.join(__dirname, '..', 'electron', 'index.html'),
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

	devToolsInstaller
		.default(devToolsInstaller.REACT_DEVELOPER_TOOLS)
		.then(name => {
			console.info(`Added Extension:  ${name}`);
		})
		.catch(err => {
			console.warn('An error occurred: ', err);
		});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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
		// tslint:disable-next-line:no-any
		autoUpdater.checkForUpdatesAndNotify().catch((e: any) => {
			console.log('There was a error:', e);
		});
	}
});
