import { createGithubIssueUrl } from './create-github-issue-url';
import * as Electron from 'electron';

export function showError(error: Error): void {
	const url = createGithubIssueUrl(error);
	const lines = error.message.split('\n');

	Electron.dialog.showMessageBox(
		Electron.BrowserWindow.getFocusedWindow(),
		{
			type: 'error',
			message: lines[0],
			detail: lines.slice(1).join('\n'),
			buttons: ['OK', 'Report a bug']
		},
		response => {
			if (response === 1) {
				Electron.shell.openExternal(url);
			}
		}
	);
}
