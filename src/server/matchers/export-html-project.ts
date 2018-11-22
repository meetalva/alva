import * as Message from '../../message';
import * as Types from '../../types';
import * as Path from 'path';
import * as uuid from 'uuid';
import * as Export from '../../export';
import * as Fs from 'fs';

export function exportHtmlProject(
	server: Types.AlvaServer
): (message: Message.ExportHtmlProject) => Promise<void> {
	return async m => {
		const app = await server.host.getApp();
		const sender = app || server.sender;
		const appId = m.appId || (app ? app.getId() : undefined);
		const project = await server.dataHost.getProject(m.payload.projectId);

		if (!project) {
			return;
		}

		const name = m.payload.path ? Path.basename(m.payload.path) : `${project.getName()}.html`;
		const targetPath =
			m.payload.path ||
			(await server.host.selectSaveFile({
				defaultPath: `/${name}`,
				title: `Export ${project.getName()} as HTML file`,
				filters: [
					{
						name: project.getName(),
						extensions: ['html', 'htm']
					}
				]
			}));

		if (!targetPath) {
			return;
		}

		const htmlExport = await Export.exportHtmlProject({
			project,
			port: server.port
		});

		if (htmlExport.type === Types.ExportResultType.ExportError) {
			sender.send({
				appId,
				type: Message.MessageType.ShowError,
				transaction: m.transaction,
				id: uuid.v4(),
				payload: {
					message: `HTML Export for ${project.getName()} failed.`,
					detail: `It threw the following error: ${htmlExport.error.message}`,
					error: {
						message: htmlExport.error.message,
						stack: htmlExport.error.stack || ''
					}
				}
			});
			return;
		}

		const fsResult = await dumpFirstFile(htmlExport.fs, targetPath);

		if (fsResult.type === FsResultType.FsError) {
			sender.send({
				appId,
				type: Message.MessageType.ShowError,
				transaction: m.transaction,
				id: uuid.v4(),
				payload: {
					message: `HTML Export for ${project.getName()} failed.`,
					detail: `It threw the following error: ${fsResult.error.message}`,
					error: {
						message: fsResult.error.message,
						stack: fsResult.error.stack || ''
					}
				}
			});
			return;
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
