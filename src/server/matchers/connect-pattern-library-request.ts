import * as Message from '../../message';
import { MessageType } from '../../message';
import * as Types from '../../types';
import * as Model from '../../model';
import * as uuid from 'uuid';
import * as Analyzer from '../../analyzer';
import * as AlvaUtil from '../../alva-util';

export function connectPatternLibrary(
	server: Types.AlvaServer
): (message: Message.ConnectPatternLibraryRequest) => Promise<void> {
	return async message => {
		const app = await server.host.getApp();
		const sender = app || server.sender;
		const appId = message.appId || (app ? app.getId() : undefined);

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
			showAnalysisError(server, analysisResult.error);
			return;
		}

		if (!previousLibrary) {
			sender.send({
				appId,
				type: Message.MessageType.ConnectPatternLibraryResponse,
				id: message.id,
				payload: {
					analysis: analysisResult.result,
					path,
					previousLibraryId: undefined
				}
			});
		} else {
			sender.send({
				appId,
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

function showAnalysisError(server: Types.AlvaServer, error: Error): void {
	server.sender.send({
		type: MessageType.ShowMessage,
		id: uuid.v4(),
		payload: {
			message: 'Sorry, this seems to be an incompatible library.',
			detail: 'Learn more about supported component libraries on github.com/meetalva',
			buttons: [
				{
					label: 'OK'
				},
				{
					label: 'Learn more',
					message: {
						type: MessageType.OpenExternalURL,
						id: uuid.v4(),
						payload: 'https://github.com/meetalva/alva#pattern-library-requirements'
					}
				},
				{
					label: 'Report a Bug',
					message: {
						type: MessageType.OpenExternalURL,
						id: uuid.v4(),
						payload: AlvaUtil.newIssueUrl({
							user: 'meetalva',
							repo: 'alva',
							title: 'New bug report',
							body: `Hey there, I just encountered the following error with Alva:\n\n\`\`\`\n${
								error.message
							}\n\`\`\`\n\n<details><summary>Stack Trace</summary>\n\n\`\`\`\n${
								error.stack
							}\n\`\`\`\n\n</details>`,
							labels: ['type: bug']
						})
					}
				}
			]
		}
	});
}
