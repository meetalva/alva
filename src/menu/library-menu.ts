import * as Types from '../types';
import * as Message from '../message';
import * as uuid from 'uuid';

const ids = {
	library: uuid.v4(),
	connect: uuid.v4(),
	update: uuid.v4()
};

export const libraryMenu = (ctx: Types.MenuContext): Types.MenuItem => {
	const hasProject = typeof ctx.project !== 'undefined';
	const hasConnectedLibrary =
		ctx.project &&
		ctx.project
			.getPatternLibraries()
			.filter(l => l.getOrigin() !== Types.PatternLibraryOrigin.BuiltIn).length > 0;
	const onDetailView = ctx.app && ctx.app.isActiveView(Types.AlvaView.PageDetail);
	const hasFileAccess =
		ctx.app &&
		(ctx.app.isHostType(Types.HostType.LocalElectron) ||
			ctx.app.isHostType(Types.HostType.LocalServer));

	return {
		id: ids.library,
		label: '&Library',
		submenu: [
			{
				id: ids.connect,
				label: '&Connect New Library',
				enabled: hasProject && onDetailView && hasFileAccess,
				accelerator: 'CmdOrCtrl+Shift+C',
				click: sender => {
					if (typeof ctx.project === 'undefined') {
						return;
					}

					sender.send({
						id: uuid.v4(),
						payload: { library: undefined, projectId: ctx.project.getId() },
						type: Message.MessageType.ConnectPatternLibraryRequest
					});
				}
			},
			{
				id: ids.update,
				label: '&Update All Libraries',
				enabled: hasProject && onDetailView && hasConnectedLibrary && hasFileAccess,
				accelerator: 'CmdOrCtrl+U',
				click: sender => {
					if (!ctx.project) {
						return;
					}

					ctx.project
						.getPatternLibraries()
						.filter(library =>
							library.getCapabilites().includes(Types.LibraryCapability.Update)
						)
						.forEach(library => {
							sender.send({
								id: uuid.v4(),
								type: Message.MessageType.UpdatePatternLibraryRequest,
								payload: {
									id: library.getId()
								}
							});
						});
				}
			}
		]
	};
};
