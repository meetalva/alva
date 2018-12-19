import * as M from '../message';
import * as T from '../types';
import * as ContextMenu from '../context-menu';

export function showContextMenu({
	host,
	dataHost
}: T.MatcherContext): T.Matcher<M.ContextMenuRequest> {
	return async m => {
		const app = await host.getApp(m.appId || '');

		if (!app) {
			host.log(`showContextMenu: received message without resolveable app: ${m}`);
			return;
		}

		if (m.payload.menu === T.ContextMenuType.ElementMenu) {
			const project = await dataHost.getProject(m.payload.projectId);

			if (!project) {
				return;
			}

			const element = project.getElementById(m.payload.data.element.id);

			if (!element) {
				return;
			}

			host.showContextMenu({
				position: m.payload.position,
				items: ContextMenu.elementContextMenu({
					app,
					project,
					element
				})
			});
		}
	};
}
