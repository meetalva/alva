import * as Message from '../../message';
import * as Types from '../../types';

export function openFileRequest(
	server: Types.AlvaServer
): (message: Message.OpenFileRequest) => Promise<void> {
	return async message => {
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
					type: Message.MessageType.UseFileRequest,
					id: message.id,
					transaction: message.transaction,
					payload: {
						silent,
						contents
					}
				},
				{ type: Message.MessageType.UseFileResponse }
			);

			server.sender.send({
				type: Message.MessageType.OpenFileResponse,
				id: message.id,
				transaction: message.transaction,
				payload: response.payload
			});
		} catch (err) {
			if (!silent) {
				server.sender.send({
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
