import * as Message from '../../message';
import * as Types from '../../types';
import * as Model from '../../model';
import * as uuid from 'uuid';
import * as Analyzer from '../../analyzer';

const newGithubIssue = require('new-github-issue-url');

export function connectPatternLibrary(
	server: Types.AlvaServer
): (message: Message.ConnectPatternLibraryRequest) => Promise<void> {
	return async message => {
		const project = await server.dataHost.getProject(message.payload.projectId);

		if (!project) {
			return;
		}

		const path = await server.host.selectFile({
			title: 'Connect Pattern Library',
			message: 'Select a package.json file in the root of a library you want to connect to Alva',
			properties: ['openFile'],
			filters: [
				{
					name: 'package.json',
					extensions: ['json']
				}
			]
		});

		if (!path) {
			return;
		}

		const ids = await server.dataHost.getConnections(project);

		const previousLibrary = message.payload.library
			? project.getPatternLibraryById(message.payload.library)
			: project.getPatternLibraries().find(p => ids.some(id => id === p.getId()));

		if (message.payload.library && !previousLibrary) {
			return;
		}

		const analysisResult = await performAnalysis(path, { previousLibrary });

		if (analysisResult.type === Types.LibraryAnalysisResultType.Error) {
			showAnalysisError(analysisResult.error);
			return;
		}

		if (typeof analysisResult === 'undefined') {
			return;
		}

		if (!previousLibrary) {
			server.sender.send({
				type: Message.MessageType.ConnectPatternLibraryResponse,
				id: message.id,
				payload: {
					analysis: analysisResult.result,
					path,
					previousLibraryId: undefined
				}
			});
		} else {
			server.sender.send({
				type: Message.MessageType.UpdatePatternLibraryResponse,
				id: message.id,
				payload: {
					analysis: analysisResult.result,
					path,
					previousLibraryId: previousLibrary.getId()
				}
			});
		}
	};
}

async function performAnalysis(
	path: string,
	{ previousLibrary }: { previousLibrary: Model.PatternLibrary | undefined }
): Promise<Types.LibraryAnalysisResult> {
	const getGobalEnumOptionId = previousLibrary
		? previousLibrary.assignEnumOptionId.bind(previousLibrary)
		: () => uuid.v4();

	const getGlobalPatternId = previousLibrary
		? previousLibrary.assignPatternId.bind(previousLibrary)
		: () => uuid.v4();

	const getGlobalPropertyId = previousLibrary
		? previousLibrary.assignPropertyId.bind(previousLibrary)
		: () => uuid.v4();

	const getGlobalSlotId = previousLibrary
		? previousLibrary.assignSlotId.bind(previousLibrary)
		: () => uuid.v4();

	return Analyzer.analyze(path, {
		getGobalEnumOptionId,
		getGlobalPatternId,
		getGlobalPropertyId,
		getGlobalSlotId
	});
}

function showAnalysisError(error: Error): void {
	console.error(error);

	Electron.dialog.showMessageBox(
		{
			message: 'Sorry, this seems to be an incompatible library.',
			detail: 'Learn more about supported component libraries on github.com/meetalva',
			buttons: ['OK', 'Learn more', 'Report a Bug']
		},
		response => {
			if (response === 1) {
				Electron.shell.openExternal(
					'https://github.com/meetalva/alva#pattern-library-requirements'
				);
			}

			if (response === 2) {
				Electron.shell.openExternal(
					newGithubIssue({
						user: 'meetalva',
						repo: 'alva',
						title: 'New bug report',
						body: `Hey there, I just encountered the following error with Alva ${Electron.app.getVersion()}:\n\n\`\`\`\n${
							error.message
						}\n\`\`\`\n\n<details><summary>Stack Trace</summary>\n\n\`\`\`\n${
							error.stack
						}\n\`\`\`\n\n</details>`,
						labels: ['type: bug']
					})
				);
			}
		}
	);
}
