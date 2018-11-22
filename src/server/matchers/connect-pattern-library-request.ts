import * as Message from '../../message';
import { MessageType } from '../../message';
import * as Types from '../../types';
import * as Model from '../../model';
import * as uuid from 'uuid';
import * as Analyzer from '../../analyzer';

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
						payload: newGithubIssue({
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

export interface NewGithubIssuePayload {
	body?: string;
	title?: string;
	labels?: string[];
	template?: string;
	milestone?: string;
	assignee?: string;
	projects?: string[];
}

export type NewGithubIssueOptions = NewGithubIssueOptionsShortHand | NewGithubIssueOptionsLongHand;

export interface NewGithubIssueOptionsShortHand extends NewGithubIssuePayload {
	repoUrl: string;
}

export interface NewGithubIssueOptionsLongHand extends NewGithubIssuePayload {
	user: string;
	repo: string;
}

const URLSearchParams = require('url-search-params');

function newGithubIssue(options): string {
	let repoUrl;

	if (options.repoUrl) {
		repoUrl = options.repoUrl;
	} else if (options.user && options.repo) {
		repoUrl = `https://github.com/${options.user}/${options.repo}`;
	} else {
		throw new Error(
			'You need to specify either the `repoUrl` option or both the `user` and `repo` options'
		);
	}

	const types = ['body', 'title', 'labels', 'template', 'milestone', 'assignee', 'projects'];

	const params = types.reduce((ps, type) => {
		let value = options[type];

		if (value === undefined) {
			return ps;
		}

		if (type === 'labels' || type === 'projects') {
			if (!Array.isArray(value)) {
				throw new TypeError(`The \`${type}\` option should be an array`);
			}

			value = value.join(',');
		}

		ps.set(type, value);
		return ps;
	}, new URLSearchParams());

	return `${repoUrl}/issues/new?${params.toString()}`;
}
