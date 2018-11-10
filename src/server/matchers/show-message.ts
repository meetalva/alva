import * as Message from '../../message';
import * as Types from '../../types';

export function showMessage(
	server: Types.AlvaServer
): (message: Message.ShowMessage) => Promise<void> {
	return async message => {
		const button = await server.host.showMessage(message.payload);

		if (button && button.message) {
			server.sender.send(button.message);
		}
	};
}
