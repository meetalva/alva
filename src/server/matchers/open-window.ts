import * as Message from '../../message';
import * as Types from '../../types';

export function openWindow(
	server: Types.AlvaServer
): (message: Message.OpenWindow) => Promise<void> {
	return async message => {
		switch (message.payload.view) {
			case Types.AlvaView.PageDetail:
				await server.host.createWindow(
					`http://localhost:${server.port}/project/${message.payload.projectId}`
				);
				return;
			case Types.AlvaView.SplashScreen:
				await server.host.createWindow(`http://localhost:${server.port}/`);
				return;
		}
	};
}
