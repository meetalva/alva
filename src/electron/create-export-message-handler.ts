import * as Export from '../export';
import * as Fs from 'fs';
import * as Message from '../message';
import { requestProject } from './request-project';
import { showError } from './show-error';
import { showSaveDialog } from './show-save-dialog';
import * as Types from '../types';

import {
	ServerMessageHandlerContext,
	ServerMessageHandlerInjection
} from './create-server-message-handler';

export async function createExportMessageHandler(
	ctx: ServerMessageHandlerContext,
	injection: ServerMessageHandlerInjection
): Promise<(message: Message.Message) => Promise<void>> {
	return async function exportMessageHandler(message: Message.Message): Promise<void> {
		switch (message.type) {
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
