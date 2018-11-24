import * as M from '../message';
import * as T from '../types';
import * as uuid from 'uuid';

export function openFileRequest({ host }: T.MatcherContext): T.Matcher<M.OpenFileRequest> {
	return async m => {
		const app = await host.getApp();
		const sender = app || (await host.getSender());
		const appId = m.appId || (app ? app.getId() : undefined);

		const selectedPath = await host.selectFile({
			title: 'Open Alva File',
			properties: ['openFile'],
			filters: [
				{
					name: 'Alva File',
					extensions: ['alva']
				}
			]
		});

		const silent = m.payload && typeof m.payload.silent === 'boolean' ? m.payload.silent : false;

		if (!selectedPath) {
			return;
		}

		try {
			const { contents } = await host.readFile(selectedPath);

			const response = await (await host.getSender()).transaction<
				M.UseFileRequest,
				M.UseFileResponse
			>(
				{
					appId,
					type: M.MessageType.UseFileRequest,
					id: m.id,
					transaction: m.transaction,
					sender: m.sender,
					payload: {
						silent,
						path: selectedPath,
						replace: m.payload.replace,
						contents
					}
				},
				{ type: M.MessageType.UseFileResponse }
			);

			if (response.payload.project.status === T.ProjectPayloadStatus.Error) {
				const p = response.payload.project as T.ProjectPayloadError;

				sender.send({
					appId,
					type: M.MessageType.ShowError,
					transaction: m.transaction,
					id: m.id,
					payload: {
						message: [p.error.message].join('\n'),
						detail: p.error.stack || ''
					}
				});
			}

			if (response.payload.project.status === T.ProjectPayloadStatus.Ok) {
				const p = response.payload.project as T.ProjectPayloadSuccess;

				if (!m.payload.replace) {
					sender.send({
						id: uuid.v4(),
						type: M.MessageType.OpenWindow,
						payload: {
							view: T.AlvaView.PageDetail,
							projectId: p.contents.id
						},
						transaction: m.transaction,
						sender: m.sender
					});
				}

				sender.send({
					appId,
					type: M.MessageType.OpenFileResponse,
					id: m.id,
					transaction: m.transaction,
					payload: response.payload.project,
					sender: m.sender
				});
			}
		} catch (err) {
			if (!silent) {
				sender.send({
					appId,
					type: M.MessageType.ShowError,
					transaction: m.transaction,
					id: m.id,
					payload: {
						message: [err.message].join('\n'),
						detail: err.stack || ''
					}
				});
			}
		}
	};
}
