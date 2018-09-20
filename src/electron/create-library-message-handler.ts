import * as Analyzer from '../analyzer';
import { createCompiler } from '../compiler/create-compiler';
import { createGithubIssueUrl } from './create-github-issue-url';
import * as Electron from 'electron';
import * as Fs from 'fs';
import * as Message from '../message';
import * as Model from '../model';
import * as Path from 'path';
import { showOpenDialog } from './show-open-dialog';
import * as Types from '../types';
import * as uuid from 'uuid';
import {
	ServerMessageHandlerContext,
	ServerMessageHandlerInjection
} from './create-server-message-handler';

export async function createLibraryMessageHandler(
	ctx: ServerMessageHandlerContext,
	injection: ServerMessageHandlerInjection
): Promise<(message: Message.Message) => Promise<void>> {
	// tslint:disable-next-line:cyclomatic-complexity
	return async function libraryMessageHandler(message: Message.Message): Promise<void> {
		switch (message.type) {
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
						payload: ['previewRenderer', 'preview']
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
				if (!ctx.project) {
					return;
				}

				await injection.ephemeralStore.addConnection({
					projectId: ctx.project.getId(),
					libraryId: message.payload.id,
					libraryPath: message.payload.path
				});

				break;
			}
			case Message.MessageType.ConnectPatternLibraryRequest: {
				if (!ctx.project) {
					return;
				}

				const paths = await showOpenDialog({
					title: 'Connect Pattern Library',
					message:
						'Select a package.json file in the root of a library you want to connect to Alva',
					properties: ['openFile'],
					filters: [
						{
							name: 'package.json',
							extensions: ['json']
						}
					]
				});

				const path = Array.isArray(paths) ? paths[0] : undefined;

				if (!path) {
					return;
				}

				const connections = (await injection.ephemeralStore.getConnections()).filter(
					c => c.libraryPath === path
				);

				const previousLibrary = message.payload.library
					? ctx.project.getPatternLibraryById(message.payload.library)
					: ctx.project
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
				if (!ctx.project) {
					return;
				}

				const library = ctx.project.getPatternLibraryById(message.payload.id);

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
			}
		}
	};
}

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
			message: 'Sorry, this seems to be an incompatible library.',
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
