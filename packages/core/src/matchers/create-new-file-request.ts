import * as M from '@meetalva/message';
import * as Model from '@meetalva/model';
import * as T from '@meetalva/types';
import { Persistence } from '../persistence';
import { MatcherCreator } from './context';

export const createNewFileRequest: MatcherCreator<M.CreateNewFileRequest> = ({ host }) => {
	return async m => {
		const app = await host.getApp(m.appId || '');

		if (!app) {
			host.log(`createNewFileRequest: received message without resolveable app: ${m}`);
			return;
		}

		const draftProject = Model.Project.create({
			draft: true,
			name: 'New Project',
			path: ''
		});

		const serializeResult = await Persistence.serialize(draftProject);

		if (serializeResult.state !== T.PersistenceState.Success) {
			const err = serializeResult.error;
			host.log(err.message);

			app.send({
				type: M.MessageType.ShowError,
				transaction: m.transaction,
				id: m.id,
				payload: {
					message: [err.message].join('\n'),
					detail: err.stack || '',
					error: {
						message: err.message,
						stack: err.stack || ''
					}
				}
			});
			return;
		}

		const response = await app.transaction<M.UseFileRequest, M.UseFileResponse>(
			{
				type: M.MessageType.UseFileRequest,
				id: m.id,
				transaction: m.transaction,
				sender: m.sender,
				payload: {
					silent: false,
					replace: m.payload.replace,
					contents: serializeResult.contents
				}
			},
			{
				type: M.MessageType.UseFileResponse
			}
		);

		if (response.payload.project.status === T.ProjectPayloadStatus.Error) {
			const p = response.payload.project as T.ProjectPayloadError;
			host.log(p.error.message);

			app.send({
				type: M.MessageType.ShowError,
				transaction: m.transaction,
				id: m.id,
				payload: {
					message: [p.error.message].join('\n'),
					detail: p.error.stack || '',
					error: {
						message: p.error.message,
						stack: p.error.stack || ''
					}
				}
			});
		}

		const p = response.payload.project as T.ProjectPayloadSuccess;

		app.send({
			id: m.id,
			type: M.MessageType.CreateNewFileResponse,
			payload: p,
			transaction: m.transaction,
			sender: m.sender
		});
	};
};
