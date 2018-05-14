import { checkForUpdates } from './auto-updater';
import { colors } from '../components';
import { createCompiler } from '../preview/create-compiler';
import { app, BrowserWindow, dialog, ipcMain, screen } from 'electron';
import * as electronIsDev from 'electron-is-dev';
import * as Fs from 'fs';
import * as getPort from 'get-port';
import * as stringEscape from 'js-string-escape';
import { PreviewMessageType, ServerMessageType } from '../message';
import * as MimeTypes from 'mime-types';
import { Page, Project } from '../model';
import * as Path from 'path';
import { Persistence, PersistenceState } from '../persistence';
import * as Sender from '../message/server';
import { createServer } from './server';
import * as Types from '../model/types';
import * as Url from 'url';
import * as Util from 'util';
import * as uuid from 'uuid';

const APP_ENTRY = require.resolve('./renderer');

const RENDERER_DOCUMENT = `<!doctype html>
<html>
<body>
	<div id="app" style="overflow: hidden; width: 100%; height: 100%;"></div>
	<script>require('${stringEscape(APP_ENTRY)}')</script>
</body>
</html>`;

Fs.writeFileSync(Path.join(__dirname, 'app.html'), RENDERER_DOCUMENT);

const showOpenDialog = (options: Electron.OpenDialogOptions): Promise<string[]> =>
	new Promise(resolve => dialog.showOpenDialog(options, resolve));

const showSaveDialog = (options: Electron.SaveDialogOptions): Promise<string | undefined> =>
	new Promise(resolve => dialog.showSaveDialog(options, resolve));

const readFile = Util.promisify(Fs.readFile);
const writeFile = Util.promisify(Fs.writeFile);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | undefined;

let projectPath: string | undefined;

async function createWindow(): Promise<void> {
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
		Url.format({
			pathname: Path.join(__dirname, 'app.html'),
			protocol: 'file:',
			slashes: true
		})
	);

	// Cast getPort return type from PromiseLike<number> to Promise<number>
	// to avoid async-promise tslint rule to produce errors here
	const port = await (getPort({ port: 1879 }) as Promise<number>);
	const server = await createServer({ port });

	Sender.receive(async message => {
		if (!message) {
			return;
		}

		// Reflect messages to client
		Sender.send(message);

		// Emit messages to preview
		server.emit('message', message);

		// Handle messages that require
		// access to system / fs
		// tslint:disable-next-line:cyclomatic-complexity
		switch (message.type) {
			case ServerMessageType.AppLoaded: {
				// Load last known file automatically in development
				if (electronIsDev && projectPath) {
					const result = await Persistence.read<Types.SavedProject>(projectPath);

					if (result.state === PersistenceState.Error) {
						// TODO: Show user facing error here
					} else {
						const contents = result.contents as Types.SerializedProject;
						contents.path = projectPath;

						Sender.send({
							type: ServerMessageType.OpenFileResponse,
							id: message.id,
							payload: { path: projectPath, contents }
						});
					}
				}

				Sender.send({
					id: uuid.v4(),
					type: ServerMessageType.StartApp,
					payload: String(port)
				});

				break;
			}
			case ServerMessageType.CreateNewFileRequest: {
				const path = await showSaveDialog({
					title: 'Create New Alva File',
					defaultPath: 'Untitled Project.alva',
					filters: [
						{
							name: 'Alva File',
							extensions: ['alva']
						}
					]
				});

				if (electronIsDev) {
					projectPath = path;
				}

				if (path) {
					const project = Project.create({
						name: 'Untitled Project',
						path
					});

					project.addPage(
						Page.create(
							{
								id: uuid.v4(),
								name: 'Untitled Page',
								patternLibrary: project.getPatternLibrary()
							},
							{ project, patternLibrary: project.getPatternLibrary() }
						)
					);

					await Persistence.persist(path, project);

					Sender.send({
						type: ServerMessageType.CreateNewFileResponse,
						id: message.id,
						payload: {
							path,
							contents: project.toJSON()
						}
					});
				}
				break;
			}
			case ServerMessageType.OpenFileRequest: {
				const paths = await showOpenDialog({
					title: 'Open Alva File',
					properties: ['openFile'],
					filters: [
						{
							name: 'Alva File',
							extensions: ['alva']
						}
					]
				});

				const path = Array.isArray(paths) ? paths[0] : undefined;

				if (electronIsDev) {
					projectPath = path;
				}

				if (path) {
					const result = await Persistence.read<Types.SavedProject>(path);

					if (result.state === PersistenceState.Error) {
						// TODO: Show user facing error here
					} else {
						const contents = result.contents as Types.SerializedProject;
						contents.path = path;

						Sender.send({
							type: ServerMessageType.OpenFileResponse,
							id: message.id,
							payload: { path, contents }
						});
					}
				}
				break;
			}
			case ServerMessageType.AssetReadRequest: {
				const paths = await showOpenDialog({
					title: 'Select an image',
					properties: ['openFile']
				});

				if (!paths) {
					return;
				}

				const path = paths[0];

				if (!path) {
					return;
				}

				// TODO: Handle errors
				const content = await readFile(path);
				const mimeType = MimeTypes.lookup(path) || 'application/octet-stream';

				Sender.send({
					type: ServerMessageType.AssetReadResponse,
					id: message.id,
					payload: `data:${mimeType};base64,${content.toString('base64')}`
				});

				break;
			}
			case ServerMessageType.Save: {
				const project = Project.from(message.payload.project);
				project.setPath(message.payload.path);

				if (process.env.NODE_ENV === 'development') {
					projectPath = project.getPath();
				}

				await Persistence.persist(project.getPath(), project);
				break;
			}
			case ServerMessageType.CreateScriptBundleRequest: {
				const compiler = createCompiler();
				await Util.promisify(compiler.run).bind(compiler)();

				const createScript = (name: string, content: string) =>
					`<script data-script="${name}">${content}<\/script>`;
				const SCRIPTS = ['vendor', 'renderer', 'components', 'preview'];

				const compilerFileSystem = (await compiler.outputFileSystem) as typeof Fs;

				const scripts = SCRIPTS.map(name => [
					name,
					compilerFileSystem.readFileSync(Path.posix.join('/', `${name}.js`)).toString()
				])
					.map(([name, content]) => createScript(name, content))
					.join('\n');

				Sender.send({
					type: ServerMessageType.CreateScriptBundleResponse,
					id: message.id,
					payload: scripts
				});

				break;
			}
			case ServerMessageType.ExportHTML:
			case ServerMessageType.ExportPDF:
			case ServerMessageType.ExportPNG:
			case ServerMessageType.ExportSketch: {
				const { path, content } = message.payload;
				writeFile(path, content);
			}
		}
	});

	// Handle messages from preview
	server.on('client-message', (envelope: string) => {
		try {
			const message = JSON.parse(envelope);

			switch (message.type) {
				case PreviewMessageType.ContentResponse: {
					Sender.send({
						id: message.id,
						payload: message.payload,
						type: ServerMessageType.ContentResponse
					});
					break;
				}
				case PreviewMessageType.SketchExportResponse: {
					Sender.send({
						id: message.id,
						payload: message.payload,
						type: ServerMessageType.SketchExportResponse
					});
				}
			}
		} catch (err) {
			console.error('Error while receiving client message');
			console.error(err);
		}
	});

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
app.on('ready', async () => {
	await createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', async () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (!win) {
		await createWindow();
	}
});

ipcMain.on('request-check-for-updates', () => {
	if (win) {
		checkForUpdates(win, true);
	}
});

process.on('unhandledRejection', reason => {
	console.error(reason);
});
