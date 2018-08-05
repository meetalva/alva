import { AlvaApp, Project } from '../../model';

export interface MainMenuContext {
	app: AlvaApp;
	project?: Project;
}

export * from './create-app-menu';
export * from './create-edit-menu';
export * from './create-file-menu';
export * from './create-help-menu';
export * from './create-library-menu';
export * from './create-view-menu';
export * from './create-window-menu';
