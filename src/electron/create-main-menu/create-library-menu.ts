import * as Electron from 'electron';
import * as Message from '../../message';
import * as Model from '../../model';
import { Sender } from '../../sender/server';
import * as Types from '../../types';
import * as uuid from 'uuid';

export interface LibraryMenuInjection {
	sender: Sender;
}

export function createLibraryMenu(
	ctx: Types.MainMenuContext,
	injection: LibraryMenuInjection
): Electron.MenuItemConstructorOptions {
	const project = ctx.project ? Model.Project.from(ctx.project) : undefined;
	const libraries = project ? project.getPatternLibraries() : [];

	return {
		label: '&Library',
		submenu: [
			{
				label: '&Connect New Library',
				enabled: typeof ctx.project !== 'undefined',
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
				enabled:
					typeof ctx.project !== 'undefined' &&
					libraries.some(lib => lib.getState() === Types.PatternLibraryState.Connected),
				accelerator: 'CmdOrCtrl+U',
				click: () => {
					if (typeof ctx.project === 'undefined') {
						return;
					}

					Model.Project.from(ctx.project)
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
