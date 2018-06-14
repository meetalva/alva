import * as Analyzer from '../analyzer';
import { checkForUpdates } from './auto-updater';
import * as ConvertColor from 'color';
import { Color } from '../components/colors';
import { createCompiler } from '../compiler/create-compiler';
import { app, BrowserWindow, dialog, screen, shell } from 'electron';
import * as electronIsDev from 'electron-is-dev';
import * as Fs from 'fs';
import * as getPort from 'get-port';
import * as stringEscape from 'js-string-escape';
import { isEqual, uniqWith } from 'lodash';
import { PreviewMessageType, ServerMessage, ServerMessageType } from '../message';
import * as MimeTypes from 'mime-types';
import { Project } from '../model';
import * as Path from 'path';
import { Persistence, PersistenceState } from '../persistence';
import * as Sender from '../message/server';
import { createServer } from './server';
import * as Types from '../types';
import * as Util from 'util';
import * as uuid from 'uuid';

const ElectronStore = require('electron-store');
const log = require('electron-log');
const URLSearchParams = require('url-search-params');

const APP_ENTRY = require.resolve('./renderer');

const RENDERER_DOCUMENT = `<!doctype html>
<html>
<head>
	<meta http-equiv="Content-Security-Policy" content="script-src 'unsafe-inline'">
</head>
<body>
	<div id="app" style="overflow: hidden; width: 100%; height: 100%;"></div>
	<script>require('${stringEscape(APP_ENTRY)}')</script>
</body>
</html>`;

const showOpenDialog = (options: Electron.OpenDialogOptions): Promise<string[]> =>
	new Promise(resolve =>
		dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), options, resolve)
	);

const showSaveDialog = (options: Electron.SaveDialogOptions): Promise<string | undefined> =>
	new Promise(resolve =>
		dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), options, resolve)
	);

const readFile = Util.promisify(Fs.readFile);
const writeFile = Util.promisify(Fs.writeFile);

const readProjectOrError = async <T>(path: string): Promise<Types.SavedProject | undefined> => {
	const result = await Persistence.read<Types.SavedProject>(path);

	if (result.state === PersistenceState.Error) {
		result.error.message = [
			`Sorry, we had trouble opening the file "${Path.basename(path)}".`,
			result.error.message
		].join('\n');
		showError(result.error);
		return;
	}

	return result.contents;
};

const showError = (error: Error) => {
	const params = new URLSearchParams();
	params.set('title', 'New bug report');
	params.set(
		'body',
		`Hey there, I just encountered the following error with Alva ${app.getVersion()}:\n\n\`\`\`\n${
			error.message
		}\n\`\`\`\n\n<details><summary>Stack Trace</summary>\n\n\`\`\`\n${
			error.stack
		}\n\`\`\`\n\n</details>`
	);
	params.append('labels', 'type: bug');

	const url = `https://github.com/meetalva/alva/issues/new?${params}`;
	const lines = error.message.split('\n');

	projectPath = undefined;
	openedFile = undefined;

	dialog.showMessageBox(
		BrowserWindow.getFocusedWindow(),
		{
			type: 'error',
			message: lines[0],
			detail: lines.slice(1).join('\n'),
			buttons: ['OK', 'Report a bug']
		},
		response => {
			if (response === 1) {
				shell.openExternal(url);
			}
		}
	);
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | undefined;

let openedFile: string | undefined;

let projectPath: string | undefined;

const userStore = new ElectronStore();

(async () => {
	// Cast getPort return type from PromiseLike<number> to Promise<number>
	// to avoid async-promise tslint rule to produce errors here
	const port = await (getPort({ port: 1879 }) as Promise<number>);
	const server = await createServer({ port });

	const send = (message: ServerMessage): void => {
		Sender.send(message);
		server.emit('message', message);
	};

	Sender.receive(async message => {
		if (!message) {
			return;
		}

		send(message);

		// Handle messages that require
		// access to system / fs
		// tslint:disable-next-line:cyclomatic-complexity
		switch (message.type) {
			case ServerMessageType.CheckForUpdatesRequest: {
				if (win) {
					checkForUpdates(win, true);
				}
				break;
			}
			case ServerMessageType.AppLoaded: {
				const pathToOpen = projectPath || openedFile;

				send({
					id: uuid.v4(),
					type: ServerMessageType.StartApp,
					payload: String(port)
				});

				// Load one of either
				// (1) last known file automatically in development
				// (2) file passed to electron main process
				if (((electronIsDev && projectPath) || openedFile) && pathToOpen) {
					// tslint:disable-next-line:no-any
					const project = (await readProjectOrError(pathToOpen)) as any;

					if (!project) {
						return;
					}

					if (typeof project === 'object') {
						project.path = pathToOpen;
					}

					send({
						type: ServerMessageType.OpenFileResponse,
						id: message.id,
						payload: { path: pathToOpen, contents: project }
					});
				}

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

					await Persistence.persist(path, project);

					app.addRecentDocument(path);

					send({
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
					// tslint:disable-next-line:no-any
					const project = (await readProjectOrError(path)) as any;

					if (!project) {
						return;
					}

					if (typeof project === 'object') {
						project.path = path;
					}

					app.addRecentDocument(path);

					send({
						type: ServerMessageType.OpenFileResponse,
						id: message.id,
						payload: { path, contents: project }
					});
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

				send({
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
				const compiler = createCompiler([], { cwd: process.cwd(), infrastructure: true });

				compiler.run(err => {
					if (err) {
						// TODO: Handle errrors
						return;
					}

					const outputFileSystem = compiler.outputFileSystem;

					send({
						type: ServerMessageType.CreateScriptBundleResponse,
						id: message.id,
						payload: ['renderer', 'preview']
							.map(name => ({ name, path: Path.posix.join('/', `${name}.js`) }))
							.map(({ name, path }) => ({
								name,
								path,
								contents: outputFileSystem.readFileSync(path)
							}))
					});
				});

				break;
			}
			case ServerMessageType.ExportHTML:
			case ServerMessageType.ExportPDF:
			case ServerMessageType.ExportPNG:
			case ServerMessageType.ExportSketch: {
				const { path, content } = message.payload;
				writeFile(path, content);
				break;
			}
			case ServerMessageType.ConnectPatternLibraryRequest: {
				const paths = await showOpenDialog({
					title: 'Connnect Pattern Library',
					properties: ['openDirectory']
				});

				const path = Array.isArray(paths) ? paths[0] : undefined;

				if (!path) {
					return;
				}

				const project = Project.from(message.payload);
				const library = project.getPatternLibrary();

				try {
					const analysis = await Analyzer.analyze(path, {
						getGobalEnumOptionId: (patternId, contextId) =>
							library.assignEnumOptionId(patternId, contextId),
						getGlobalPatternId: contextId => library.assignPatternId(contextId),
						getGlobalPropertyId: (patternId, contextId) =>
							library.assignPropertyId(patternId, contextId),
						getGlobalSlotId: (patternId, contextId) =>
							library.assignSlotId(patternId, contextId)
					});

					send({
						type: ServerMessageType.ConnectPatternLibraryResponse,
						id: message.id,
						payload: analysis
					});
				} catch {
					dialog.showMessageBox(
						{
							message:
								'Sorry, this seems to be an uncompatible library. Learn more about supported component libraries on github.com/meetalva',
							buttons: ['OK', 'Learn more']
						},
						response => {
							if (response === 1) {
								shell.openExternal(
									'https://github.com/meetalva/alva#pattern-library-requirements'
								);
							}
						}
					);
				}

				break;
			}
			case ServerMessageType.UpdatePatternLibraryRequest: {
				const project = Project.from(message.payload);
				const library = project.getPatternLibrary();
				const id = library.getId();

				const connections = userStore.get('connections') || [];

				const connection = connections
					.filter(
						c =>
							typeof c === 'object' && typeof c.path === 'string' && typeof c.id === 'string'
					)
					.find(c => c.id === id);

				if (!connection) {
					return;
				}

				try {
					const analysis = await Analyzer.analyze(connection.path, {
						getGobalEnumOptionId: (patternId, contextId) =>
							library.assignEnumOptionId(patternId, contextId),
						getGlobalPatternId: contextId => library.assignPatternId(contextId),
						getGlobalPropertyId: (patternId, contextId) =>
							library.assignPropertyId(patternId, contextId),
						getGlobalSlotId: (patternId, contextId) =>
							library.assignSlotId(patternId, contextId)
					});

					send({
						type: ServerMessageType.ConnectPatternLibraryResponse,
						id: message.id,
						payload: analysis
					});
				} catch {
					dialog.showMessageBox(
						{
							message:
								'Sorry, this seems to be an uncompatible library. Learn more about supported component libraries on github.com/meetalva',
							buttons: ['OK', 'Learn more']
						},
						response => {
							if (response === 1) {
								shell.openExternal(
									'https://github.com/meetalva/alva#pattern-library-requirements'
								);
							}
						}
					);
				}

				break;
			}
			case ServerMessageType.ConnectedPatternLibraryNotification: {
				// Save connections between Alva files and pattern library folders
				// in user-specific persistence
				const previous = userStore.get('connections') || [];
				const previousConnections = (Array.isArray(previous) ? previous : [previous]).filter(
					p => typeof p === 'object' && typeof p.path === 'string' && typeof p.id === 'string'
				);

				const connections = uniqWith([...previousConnections, message.payload], isEqual);
				userStore.set('connections', connections);

				break;
			}
			case ServerMessageType.CheckLibraryRequest: {
				const connections = userStore.get('connections') || [];

				connections.filter(c => c.id === message.payload.id).forEach(connection => {
					Fs.exists(connection.path, async exists => {
						send({
							id: message.id,
							type: ServerMessageType.CheckLibraryResponse,
							payload: [
								{
									id: connection.id,
									path: connection.path,
									connected: exists
								}
							]
						});
					});
				});

				break;
			}

			case ServerMessageType.OpenExternalURL: {
				shell.openExternal(message.payload);

				break;
			}
			case ServerMessageType.Maximize: {
				if (win) {
					win.isMaximized() ? win.unmaximize() : win.maximize();
				}

				break;
			}
			case ServerMessageType.ShowError: {
				const error = new Error(message.payload.message);
				error.stack = message.payload.stack;
				showError(error);
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
					break;
				}
				case PreviewMessageType.SelectElement: {
					Sender.send({
						id: message.id,
						payload: message.payload,
						type: ServerMessageType.SelectElement
					});
					break;
				}
				case PreviewMessageType.UnselectElement: {
					Sender.send({
						id: message.id,
						payload: undefined,
						type: ServerMessageType.UnselectElement
					});
					break;
				}
				case PreviewMessageType.HighlightElement: {
					Sender.send({
						id: message.id,
						payload: message.payload,
						type: ServerMessageType.HighlightElement
					});
					break;
				}
				case PreviewMessageType.ChangeActivePage: {
					Sender.send({
						id: message.id,
						payload: message.payload,
						type: ServerMessageType.ActivatePage
					});
				}
			}
		} catch (err) {
			console.error('Error while receiving client message');
			console.error(err);
		}
	});
})();

async function createWindow(): Promise<void> {
	const { width = 1280, height = 800 } = screen.getPrimaryDisplay().workAreaSize;

	// Create the browser window.
	win = new BrowserWindow({
		width,
		height,
		minWidth: 780,
		minHeight: 380,
		titleBarStyle: 'hiddenInset',
		backgroundColor: ConvertColor(Color.Grey97)
			.hex()
			.toString(),
		title: 'Alva'
	});

	// and load the index.html of the app.
	win.loadURL('data:text/html;charset=utf-8,' + encodeURI(RENDERER_DOCUMENT));

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
}

log.info('App starting...');

app.on('will-finish-launching', () => {
	app.on('open-file', async (event, path) => {
		event.preventDefault();

		if (!path) {
			return;
		}

		// tslint:disable-next-line:no-any
		const project = (await readProjectOrError(path)) as any;

		if (!project) {
			return;
		}

		if (typeof project === 'object') {
			project.path = path;
		}

		openedFile = path;

		Sender.send({
			type: ServerMessageType.OpenFileResponse,
			id: uuid.v4(),
			payload: { path, contents: project }
		});
	});
});

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

process.on('unhandledRejection', reason => {
	console.error(reason);
});
