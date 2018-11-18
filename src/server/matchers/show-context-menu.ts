import * as Message from '../../message';
import * as Types from '../../types';
import * as ContextMenu from '../../context-menu';

export function showContextMenu(
	server: Types.AlvaServer
): (message: Message.ContextMenuRequest) => Promise<void> {
	return async m => {
		if (m.payload.menu === Types.ContextMenuType.ElementMenu) {
			const project = await server.dataHost.getProject(m.payload.projectId);

			if (!project) {
				return;
			}

			const element = project.getElementById(m.payload.data.element.id);

			if (!element) {
				return;
			}

			server.host.showContextMenu({
				position: m.payload.position,
				items: ContextMenu.elementContextMenu({
					app: {} as any, // ?
					project,
					element
				})
			});
		}
	};
}
