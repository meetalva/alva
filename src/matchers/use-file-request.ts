import * as M from '../message';
import * as T from '../types';
import { Persistence } from '../persistence';
import * as uuid from 'uuid';
import * as Path from 'path';
import * as Model from '../model';

export function useFileRequest({ dataHost, host }: T.MatcherContext): T.Matcher<M.UseFileRequest> {
	return async message => {
		const app = await host.getApp();
		const sender = app || (await host.getSender());
		const appId = message.appId || (app ? app.getId() : undefined);

		const projectResult = await Persistence.parse<T.SerializedProject>(message.payload.contents);

		const silent =
			message.payload && typeof message.payload.silent === 'boolean'
				? message.payload.silent
				: false;

		if (projectResult.state === T.PersistenceState.Error) {
			if (!silent) {
				sender.send({
					appId,
					type: M.MessageType.ShowError,
					id: message.id,
					payload: {
						message: [projectResult.error.message].join('\n'),
						detail: projectResult.error.stack || '',
						error: {
							message: projectResult.error.message,
							stack: projectResult.error.stack || ''
						}
					}
				});
			}

			return;
		}

		const result = Model.Project.toResult(projectResult.contents);

		if (result.status !== T.ProjectStatus.Ok) {
			sender.send({
				appId,
				type: M.MessageType.ShowError,
				transaction: message.transaction,
				id: message.id,
				payload: {
					message: `Sorry, we had trouble reading this project`,
					detail: `Parsing it failed with: ${result.error.message}`,
					error: {
						message: result.error.message,
						stack: result.error.stack || ''
					}
				}
			});

			return;
		}

		const draftProject = result.result;

		if (!message.payload.path) {
			const draftPath = await host.resolveFrom(T.HostBase.AppData, `${uuid.v4()}.alva`);
			draftProject.setPath(draftPath);

			await host.mkdir(Path.dirname(draftPath));
			await host.writeFile(draftPath, JSON.stringify(draftProject.toDisk()));
		} else {
			draftProject.setPath(message.payload.path);
		}

		await dataHost.addProject(draftProject);

		if (typeof window === 'undefined') {
			draftProject.sync(await host.getSender());
		}

		return sender.send({
			type: M.MessageType.UseFileResponse,
			appId,
			id: message.id,
			transaction: message.transaction,
			sender: message.sender,
			payload: {
				project: {
					path: draftProject.getPath(),
					contents: draftProject.toJSON(),
					status: T.ProjectPayloadStatus.Ok
				},
				replace: message.payload.replace
			}
		});
	};
}
