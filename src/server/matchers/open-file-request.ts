import * as Message from '../../message';
import * as Types from '../../types';
import * as uuid from 'uuid';

export function openFileRequest(
	server: Types.AlvaServer
): (message: Message.OpenFileRequest) => Promise<void> {
	return async message => {
		const app = await server.host.getApp();
		const sender = app || server.sender;
		const appId = message.appId || (app ? app.getId() : undefined);

		const selectedPath = await server.host.selectFile({
			title: 'Open Alva File',
			properties: ['openFile'],
			filters: [
				{
					name: 'Alva File',
					extensions: ['alva']
				}
			]
		});

		const silent =
			message.payload && typeof message.payload.silent === 'boolean'
				? message.payload.silent
				: false;

		if (!selectedPath) {
			return;
		}

		try {
			const { contents } = await server.host.readFile(selectedPath);

			const response = await server.sender.transaction<
				Message.UseFileRequest,
				Message.UseFileResponse
			>(
				{
					appId,
					type: Message.MessageType.UseFileRequest,
					id: message.id,
					transaction: message.transaction,
					sender: message.sender,
					payload: {
						silent,
						path: selectedPath,
						replace: message.payload.replace,
						contents
					}
				},
				{ type: Message.MessageType.UseFileResponse }
			);

			if (response.payload.project.status === Types.ProjectPayloadStatus.Error) {
				const p = response.payload.project as Types.ProjectPayloadError;

				sender.send({
					appId,
					type: Message.MessageType.ShowError,
					transaction: message.transaction,
					id: message.id,
					payload: {
						message: [p.error.message].join('\n'),
						detail: p.error.stack || ''
					}
				});
			}

			if (response.payload.project.status === Types.ProjectPayloadStatus.Ok) {
				const p = response.payload.project as Types.ProjectPayloadSuccess;

				if (!message.payload.replace) {
					sender.send({
						id: uuid.v4(),
						type: Message.MessageType.OpenWindow,
						payload: {
							view: Types.AlvaView.PageDetail,
							projectId: p.contents.id
						},
						transaction: message.transaction,
						sender: message.sender
					});
				}

				sender.send({
					appId,
					type: Message.MessageType.OpenFileResponse,
					id: message.id,
					transaction: message.transaction,
					payload: response.payload.project,
					sender: message.sender
				});
			}
		} catch (err) {
			if (!silent) {
				sender.send({
					appId,
					type: Message.MessageType.ShowError,
					transaction: message.transaction,
					id: message.id,
					payload: {
						message: [err.message].join('\n'),
						detail: err.stack || ''
					}
				});
			}
		}
	};
}
