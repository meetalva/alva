import * as Electron from 'electron';
import { Project } from '../model';

export enum DiscardDialogResult {
	Save,
	Cancel,
	Discard
}

export async function showDiscardDialog(project: Project): Promise<DiscardDialogResult> {
	return new Promise<DiscardDialogResult>(resolve => {
		Electron.dialog.showMessageBox(
			Electron.BrowserWindow.getFocusedWindow(),
			{
				type: 'warning',
				message: `Do you want to save the changes you made to ${project.getName()}?`,
				detail: "Your changes will be lost if you don't save them.",
				buttons: ['Save', 'Cancel', "Don't Save"]
			},
			response => {
				switch (response) {
					case 0:
						return resolve(DiscardDialogResult.Save);
					case 2:
						return resolve(DiscardDialogResult.Discard);
					case 1:
					default:
						return resolve(DiscardDialogResult.Cancel);
				}
			}
		);
	});
}
