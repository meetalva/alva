import * as uuid from 'uuid';
import * as Path from 'path';
import * as M from '@meetalva/message';
import * as T from '@meetalva/types';
import * as Model from '@meetalva/model';
import * as ModelTree from '@meetalva/model-tree';
import { Persistence } from '../persistence';
import { MatcherCreator } from './context';

export const useFileRequest: MatcherCreator<M.UseFileRequest> = ({ host, dataHost }) => {
	return async m => {
		const sender = (await host.getApp(m.appId || '')) || (await host.getSender());

		const projectResult = await Persistence.parse<T.SerializedProject>(m.payload.contents);

		const silent = m.payload && typeof m.payload.silent === 'boolean' ? m.payload.silent : false;

		if (projectResult.state === T.PersistenceState.Error) {
			host.log(`useFileRequest: ${projectResult.error.message}`);

			if (!silent) {
				sender.send({
					type: M.MessageType.ShowError,
					transaction: m.transaction,
					id: m.id,
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
			host.log(`useFileRequest: ${result.error.message}`);

			sender.send({
				type: M.MessageType.ShowError,
				transaction: m.transaction,
				id: m.id,
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

		if (!m.payload.path) {
			const draftPath = await host.resolveFrom(T.HostBase.AppData, `${uuid.v4()}.alva`);
			draftProject.setPath(draftPath);

			await host.mkdir(Path.dirname(draftPath));
			await host.writeFile(draftPath, JSON.stringify(draftProject.toDisk()));
		} else {
			draftProject.setPath(m.payload.path);
		}

		await dataHost.addProject(draftProject);

		if (typeof window === 'undefined') {
			draftProject.sync(await host.getSender(), ModelTree);
		}

		const connections = await dataHost.getConnections(draftProject);

		await Promise.all(
			draftProject
				.getPatternLibraries()
				.filter(l => l.getOrigin() !== T.PatternLibraryOrigin.BuiltIn)
				.map(async library => {
					const connection = connections.find(
						connection => connection.id === `${library.getName()}@${library.getVersion()}`
					);

					if (!connection) {
						library.setState(T.PatternLibraryState.Disconnected);
						return;
					}

					if (!await host.exists(connection.path)) {
						library.setState(T.PatternLibraryState.Disconnected);
						return;
					}

					library.setState(T.PatternLibraryState.Connected);
				})
		);

		return sender.send({
			type: M.MessageType.UseFileResponse,
			id: m.id,
			transaction: m.transaction,
			sender: m.sender,
			payload: {
				project: {
					path: draftProject.getPath(),
					contents: draftProject.toJSON(),
					status: T.ProjectPayloadStatus.Ok
				},
				replace: m.payload.replace
			}
		});
	};
};
