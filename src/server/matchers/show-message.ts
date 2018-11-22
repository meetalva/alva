import * as Message from '../../message';
import * as Types from '../../types';

export function showMessage(
	server: Types.AlvaServer
): (message: Message.ShowMessage) => Promise<void> {
	return async message => {
		const app = await server.host.getApp();
		const sender = app || server.sender;
		const appId = message.appId || (app ? app.getId() : undefined);

		const button = await server.host.showMessage(message.payload);

		if (button && button.message) {
			sender.send({ ...button.message, appId });
		}
	};
}
