import * as Electron from 'electron';
import * as Message from '../../message';
import { Sender } from '../../sender/server';
import * as Types from '../../types';
import * as uuid from 'uuid';
import { MainMenuContext } from '.';

export interface LibraryMenuInjection {
	sender: Sender;
}

export function createLibraryMenu(
	ctx: MainMenuContext,
	injection: LibraryMenuInjection
): Electron.MenuItemConstructorOptions {
	const project = ctx.project;
	const hasProject = typeof ctx.project !== 'undefined';
	const onDetailView = ctx.app.getActiveView() !== Types.AlvaView.SplashScreen;
	const libraries = project ? project.getPatternLibraries() : [];
	const hasConnectedLibrary = libraries.some(
		lib => lib.getState() === Types.PatternLibraryState.Connected
	);

	return {
		label: '&Library',
		submenu: [
			{
				label: '&Connect New Library',
				enabled: hasProject && onDetailView,
				accelerator: 'CmdOrCtrl+Shift+C',
				click: () => {
					if (typeof ctx.project === 'undefined') {
						return;
					}

					injection.sender.send({
						id: uuid.v4(),
						payload: { library: undefined },
						type: Message.MessageType.ConnectPatternLibraryRequest
					});
				}
			},
			{
				label: '&Update All Libraries',
				enabled: hasProject && onDetailView && hasConnectedLibrary,
				accelerator: 'CmdOrCtrl+U',
				click: () => {
					if (!project) {
						return;
					}

					project
						.getPatternLibraries()
						.filter(library =>
							library.getCapabilites().includes(Types.LibraryCapability.Update)
						)
						.forEach(library => {
							injection.sender.send({
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
}
