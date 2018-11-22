import * as Message from '../../message';
import * as Types from '../../types';

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
						contents
					}
				},
				{ type: Message.MessageType.UseFileResponse }
			);

			sender.send({
				appId,
				type: Message.MessageType.OpenFileResponse,
				id: message.id,
				transaction: message.transaction,
				payload: response.payload,
				sender: message.sender
			});
		} catch (err) {
			if (!silent) {
				sender.send({
					appId,
					type: Message.MessageType.ShowError,
					transaction: message.transaction,
					id: message.id,
					payload: {
						message: [err.message].join('\n'),
						stack: err.stack || ''
					}
				});
			}
		}
	};
}
