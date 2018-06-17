import * as CreateMainMenu from './create-main-menu';
import * as Electron from 'electron';
import { Sender } from '../sender/server';
import * as Types from '../types';

export interface MainMenuInjection {
	sender: Sender;
}

export function showMainMenu(ctx: Types.MainMenuContext, injection: { sender: Sender }): void {
	const mainMenu = [
		CreateMainMenu.createAppMenu(ctx, injection),
		CreateMainMenu.createFileMenu(ctx, injection),
		CreateMainMenu.createEditMenu(ctx, injection),
		CreateMainMenu.createLibraryMenu(ctx, injection),
		CreateMainMenu.createViewMenu(ctx, injection),
		CreateMainMenu.createWindowMenu(ctx),
		CreateMainMenu.createHelpMenu(ctx)
	].filter(
		(options): options is Electron.MenuItemConstructorOptions => typeof options !== 'undefined'
	);

	Electron.Menu.setApplicationMenu(Electron.Menu.buildFromTemplate(mainMenu));
}
