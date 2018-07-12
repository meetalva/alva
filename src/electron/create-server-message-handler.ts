import * as Analyzer from '../analyzer';
import { checkForUpdates } from './auto-updater';
import { createCompiler } from '../compiler/create-compiler';
import { createGithubIssueUrl } from './create-github-issue-url';
import * as Ephemeral from './ephemeral-store';
import * as Electron from 'electron';
import * as electronIsDev from 'electron-is-dev';
import * as Events from 'events';
import * as Export from '../export';
import * as Fs from 'fs';
import * as Message from '../message';
import * as MimeTypes from 'mime-types';
import * as Model from '../model';
import * as Path from 'path';
import { Persistence } from '../persistence';
import { readProjectOrError } from './read-project-or-error';
import { requestProject, requestProjectSafely } from './request-project';
import { Sender } from '../sender/server';
import { showContextMenu } from './show-context-menu';
import { showError } from './show-error';
import { showMainMenu } from './show-main-menu';
import { showOpenDialog } from './show-open-dialog';
import { showSaveDialog } from './show-save-dialog';
import * as Types from '../types';
import * as Util from 'util';
import * as uuid from 'uuid';

const readFile = Util.promisify(Fs.readFile);

export interface ServerMessageHandlerContext {
	port: undefined | number;
	win: undefined | Electron.BrowserWindow;
}

export interface ServerMessageHandlerInjection {
	emitter: Events.EventEmitter;
	ephemeralStore: Ephemeral.EphemeralStore;
	sender: Sender;
	server: Events.EventEmitter;
}

export async function createServerMessageHandler(
	ctx: ServerMessageHandlerContext,
	injection: ServerMessageHandlerInjection
): Promise<(message: Message.Message) => Promise<void>> {
	return async function serverMessageHandler(message: Message.Message): Promise<void> {
		injection.server.emit('message', message);

		// Handle messages that require
		// access to system / fs
		// tslint:disable-next-line:cyclomatic-complexity
		switch (message.type) {
			case Message.MessageType.CheckForUpdatesRequest: {
				if (ctx.win) {
					checkForUpdates(ctx.win, true);
				}
				break;
			}
			case Message.MessageType.AppLoaded: {
				const pathToOpen = await injection.ephemeralStore.getProjectPath();

				injection.sender.send({
					id: uuid.v4(),
					type: Message.MessageType.StartApp,
					payload: {
						app: await injection.ephemeralStore.getAppState(),
						port: ctx.port as number
					}
				});

				if (electronIsDev && pathToOpen) {
					injection.sender.send({
						id: uuid.v4(),
						type: Message.MessageType.OpenFileRequest,
						payload: { path: pathToOpen }
					});
				}

				break;
			}
			case Message.MessageType.Reload: {
				injection.emitter.emit('reload', message.payload || {});
				break;
			}
			case Message.MessageType.CreateNewFileRequest: {
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

				if (path) {
					const project = Model.Project.create({
						name: 'Untitled Project',
						path
					});

					await Persistence.persist(path, project);
					injection.ephemeralStore.setProjectPath(path);

					injection.sender.send({
						type: Message.MessageType.CreateNewFileResponse,
						id: message.id,
						payload: {
							path,
							contents: project.toJSON()
						}
					});
				}
				break;
			}
			case Message.MessageType.OpenFileRequest: {
				const path = await getPath(message.payload);

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

				injection.sender.send({
					type: Message.MessageType.OpenFileResponse,
					id: message.id,
					payload: { path, contents: project }
				});

				injection.ephemeralStore.setProjectPath(path);

				break;
			}
			case Message.MessageType.AssetReadRequest: {
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

				injection.sender.send({
					type: Message.MessageType.AssetReadResponse,
					id: message.id,
					payload: `data:${mimeType};base64,${content.toString('base64')}`
				});

				break;
			}
			case Message.MessageType.Save: {
				const project = Model.Project.from(message.payload.project);

				project.setPath(message.payload.path);
				injection.ephemeralStore.setProjectPath(project.getPath());

				await Persistence.persist(project.getPath(), project);
				break;
			}
			case Message.MessageType.CreateScriptBundleRequest: {
				// TODO: Come up with a proper id
				const compiler = createCompiler([], {
					cwd: process.cwd(),
					infrastructure: true,
					id: 'components'
				});

				compiler.run(err => {
					if (err) {
						// TODO: Handle errrors
						return;
					}

					const outputFileSystem = compiler.outputFileSystem;

					injection.sender.send({
						type: Message.MessageType.CreateScriptBundleResponse,
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
			case Message.MessageType.ConnectedPatternLibraryNotification: {
				const project = await requestProject(injection.sender);

				await injection.ephemeralStore.addConnection({
					projectId: project.getId(),
					libraryId: message.payload.id,
					libraryPath: message.payload.path
				});

				break;
			}
			case Message.MessageType.ConnectPatternLibraryRequest: {
				const project = await requestProject(injection.sender);

				const paths = await showOpenDialog({
					title: 'Connnect Pattern Library',
					properties: ['openDirectory']
				});

				const path = Array.isArray(paths) ? paths[0] : undefined;

				if (!path) {
					return;
				}

				const connections = (await injection.ephemeralStore.getConnections()).filter(
					c => c.libraryPath === path
				);

				const previousLibrary = message.payload.library
					? project.getPatternLibraryById(message.payload.library)
					: project
							.getPatternLibraries()
							.find(p => connections.some(c => c.libraryId === p.getId()));

				if (message.payload.library && !previousLibrary) {
					return;
				}

				const analysisResult = await performAnalysis(path, { previousLibrary });

				if (analysisResult.type === Types.LibraryAnalysisResultType.Error) {
					showAnalysisError(analysisResult.error);
					return;
				}

				if (typeof analysisResult === 'undefined') {
					return;
				}

				if (!previousLibrary) {
					injection.sender.send({
						type: Message.MessageType.ConnectPatternLibraryResponse,
						id: message.id,
						payload: {
							analysis: analysisResult.result,
							path,
							previousLibraryId: undefined
						}
					});
				} else {
					injection.sender.send({
						type: Message.MessageType.UpdatePatternLibraryResponse,
						id: message.id,
						payload: {
							analysis: analysisResult.result,
							path,
							previousLibraryId: previousLibrary.getId()
						}
					});
				}

				break;
			}
			case Message.MessageType.UpdatePatternLibraryRequest: {
				const project = await requestProject(injection.sender);
				const library = project.getPatternLibraryById(message.payload.id);

				if (!library || !library.getCapabilites().includes(Types.LibraryCapability.Update)) {
					return;
				}

				const connections = await injection.ephemeralStore.getConnections();
				const connection = connections.find(c => c.libraryId === library.getId());

				if (!connection) {
					return;
				}

				const analysisResult = await performAnalysis(connection.libraryPath, {
					previousLibrary: library
				});

				// TODO: Expose errors to UI
				if (analysisResult.type === Types.LibraryAnalysisResultType.Error) {
					return;
				}

				injection.sender.send({
					type: Message.MessageType.UpdatePatternLibraryResponse,
					id: message.id,
					payload: {
						analysis: analysisResult.result,
						path: connection.libraryPath,
						previousLibraryId: library.getId()
					}
				});

				break;
			}
			case Message.MessageType.CheckLibraryRequest: {
				const connections = await injection.ephemeralStore.getConnections();

				injection.sender.send({
					id: message.id,
					type: Message.MessageType.CheckLibraryResponse,
					payload: message.payload.libraries.map(lib => {
						const connection = connections.find(c => c.libraryId === lib);

						return {
							id: lib,
							path: connection ? connection.libraryPath : undefined,
							connected: connection ? Fs.existsSync(connection.libraryPath) : false
						};
					})
				});
				break;
			}
			case Message.MessageType.OpenExternalURL: {
				Electron.shell.openExternal(message.payload);
				break;
			}
			case Message.MessageType.Maximize: {
				if (ctx.win) {
					ctx.win.isMaximized() ? ctx.win.unmaximize() : ctx.win.maximize();
				}

				break;
			}
			case Message.MessageType.ShowError: {
				const error = new Error(message.payload.message);
				error.stack = message.payload.stack;
				showError(error);
				break;
			}
			case Message.MessageType.ContextMenuRequest: {
				showContextMenu(message.payload, { sender: injection.sender });
				break;
			}
			case Message.MessageType.ChangeApp: {
				injection.ephemeralStore.setAppState(message.payload.app);
				const project = await requestProjectSafely(injection.sender);

				showMainMenu(
					{ app: message.payload.app, project: project ? project.toJSON() : undefined },
					{ sender: injection.sender }
				);

				break;
			}
			case Message.MessageType.ExportHtmlProject: {
				const project = await requestProject(injection.sender);

				const path = await showSaveDialog({
					defaultPath: `/${project.getName()}.html`,
					title: `Export ${project.getName()} as HTML file`,
					filters: [
						{
							name: project.getName(),
							extensions: ['html', 'htm']
						}
					]
				});

				if (!path) {
					return;
				}

				const htmlExport = await Export.exportHtmlProject({ project, port: ctx.port });

				if (htmlExport.type === Types.ExportResultType.ExportError) {
					showError(htmlExport.error);
					return;
				}

				const fsResult = await dumpFirstFile(htmlExport.fs, path);

				if (fsResult.type === FsResultType.FsError) {
					showError(fsResult.error);
				}

				break;
			}
			case Message.MessageType.ExportPngPage: {
				const project = await requestProject(injection.sender);
				const activePage = project.getPages().find(p => p.getActive());

				if (!activePage) {
					return;
				}

				const index = project.getPages().indexOf(activePage);

				const path = await showSaveDialog({
					defaultPath: `${project.getName()} - ${index}.png`,
					title: `Export Page ${index} of ${project.getName()} as PNG`
				});

				if (!path) {
					return;
				}

				const pngExport = await Export.exportPngPage({
					port: ctx.port,
					page: activePage
				});

				if (pngExport.type === Types.ExportResultType.ExportError) {
					showError(pngExport.error);
					return;
				}

				const fsResult = await dumpFirstFile(pngExport.fs, path);

				if (fsResult.type === FsResultType.FsError) {
					showError(fsResult.error);
				}
				break;
			}
			case Message.MessageType.ExportSketchPage: {
				const project = await requestProject(injection.sender);
				const activePage = project.getPages().find(p => p.getActive());

				if (!activePage) {
					return;
				}

				const index = project.getPages().indexOf(activePage);

				const path = await showSaveDialog({
					defaultPath: `${project.getName()} - Page ${index}.asketch.json`,
					title: `Export Page ${index} of ${project.getName()} as .asketch.json`
				});

				if (!path) {
					return;
				}

				const sketchExport = await Export.exportSketchPage({
					port: ctx.port,
					page: activePage
				});

				if (sketchExport.type === Types.ExportResultType.ExportError) {
					showError(sketchExport.error);
					return;
				}

				const fsResult = await dumpFirstFile(sketchExport.fs, path);

				if (fsResult.type === FsResultType.FsError) {
					showError(fsResult.error);
				}
			}
		}
	};
}

const getPath = async (payload?: { path: string }): Promise<string | undefined> => {
	if (payload) {
		return payload.path;
	}

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

	return Array.isArray(paths) ? paths[0] : undefined;
};

async function performAnalysis(
	path: string,
	{ previousLibrary }: { previousLibrary: Model.PatternLibrary | undefined }
): Promise<Types.LibraryAnalysisResult> {
	const getGobalEnumOptionId = previousLibrary
		? previousLibrary.assignEnumOptionId.bind(previousLibrary)
		: () => uuid.v4();

	const getGlobalPatternId = previousLibrary
		? previousLibrary.assignPatternId.bind(previousLibrary)
		: () => uuid.v4();

	const getGlobalPropertyId = previousLibrary
		? previousLibrary.assignPropertyId.bind(previousLibrary)
		: () => uuid.v4();

	const getGlobalSlotId = previousLibrary
		? previousLibrary.assignSlotId.bind(previousLibrary)
		: () => uuid.v4();

	return Analyzer.analyze(path, {
		getGobalEnumOptionId,
		getGlobalPatternId,
		getGlobalPropertyId,
		getGlobalSlotId
	});
}

function showAnalysisError(error: Error): void {
	console.error(error);

	Electron.dialog.showMessageBox(
		{
			message: 'Sorry, this seems to be an uncompatible library.',
			detail: 'Learn more about supported component libraries on github.com/meetalva',
			buttons: ['OK', 'Learn more', 'Report a Bug']
		},
		response => {
			if (response === 1) {
				Electron.shell.openExternal(
					'https://github.com/meetalva/alva#pattern-library-requirements'
				);
			}

			if (response === 2) {
				Electron.shell.openExternal(createGithubIssueUrl(error));
			}
		}
	);
}

type FsResult<T> = FsError | FsSuccess<T>;

interface FsError {
	type: FsResultType.FsError;
	error: Error;
}

interface FsSuccess<T> {
	type: FsResultType.FsSuccess;
	payload: T;
}

enum FsResultType {
	FsError,
	FsSuccess
}

async function getFirstFile(fs: typeof Fs): Promise<FsResult<Buffer>> {
	try {
		const [firstFile] = fs.readdirSync('/');
		const firstFileContents = fs.readFileSync(`/${firstFile}`);

		return {
			type: FsResultType.FsSuccess,
			payload: firstFileContents
		};
	} catch (err) {
		return {
			type: FsResultType.FsError,
			error: err
		};
	}
}

async function dumpFirstFile(fs: typeof Fs, targetPath: string): Promise<FsResult<void>> {
	const firstFileResult = await getFirstFile(fs);

	if (firstFileResult.type === FsResultType.FsError) {
		return firstFileResult;
	}

	return writeFile(targetPath, firstFileResult.payload);
}

function writeFile(path: string, contents: Buffer): Promise<FsResult<void>> {
	return new Promise(resolve => {
		Fs.writeFile(path, contents, err => {
			if (err) {
				return resolve({
					type: FsResultType.FsError,
					error: err
				});
			}

			resolve({ type: FsResultType.FsSuccess, payload: undefined });
		});
	});
}
