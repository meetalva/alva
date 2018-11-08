import * as Message from '../../message';
import * as Types from '../../types';

export function openExternalUrl(
	server: Types.AlvaServer
): (message: Message.OpenExternalURL) => Promise<void> {
	return async message => {
		server.host.open(message.payload);
	};
}
