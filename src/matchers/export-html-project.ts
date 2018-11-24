import * as M from '../message';
import * as T from '../types';
import * as Path from 'path';
import * as uuid from 'uuid';
import * as Export from '../export';
import * as Fs from 'fs';

export function exportHtmlProject({
	host,
	dataHost,
	port
}: T.MatcherContext): T.Matcher<M.ExportHtmlProject> {
	return async m => {
		const app = await host.getApp();
		const sender = app || (await host.getSender());
		const appId = m.appId || (app ? app.getId() : undefined);
		const project = await dataHost.getProject(m.payload.projectId);

		if (!project) {
			return;
		}

		const name = m.payload.path ? Path.basename(m.payload.path) : `${project.getName()}.html`;
		const targetPath =
			m.payload.path ||
			(await host.selectSaveFile({
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
			port
		});

		if (htmlExport.type === T.ExportResultType.ExportError) {
			sender.send({
				appId,
				type: M.MessageType.ShowError,
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

		const fsResult = await dumpFirstFile(host, htmlExport.fs, targetPath);

		if (fsResult.type === FsResultType.FsError) {
			sender.send({
				appId,
				type: M.MessageType.ShowError,
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

async function dumpFirstFile(
	host: T.Host,
	fs: typeof Fs,
	targetPath: string
): Promise<FsResult<void>> {
	const firstFileResult = await getFirstFile(fs);

	if (firstFileResult.type === FsResultType.FsError) {
		return firstFileResult;
	}

	return writeFile(host, targetPath, firstFileResult.payload);
}

async function writeFile(host: T.Host, path: string, contents: Buffer): Promise<FsResult<void>> {
	try {
		host.writeFile(path, contents);
		return { type: FsResultType.FsSuccess, payload: undefined };
	} catch (err) {
		return {
			type: FsResultType.FsError,
			error: err
		};
	}
}
