import * as M from '../message';
import { MessageType } from '../message';
import * as T from '../types';
import * as Model from '../model';
import * as uuid from 'uuid';
import * as Analyzer from '../analyzer';

export function connectPatternLibrary({
	host,
	dataHost
}: T.MatcherContext): T.Matcher<M.ConnectPatternLibraryRequest> {
	return async m => {
		const app = await host.getApp(m.appId || '');

		if (!app) {
			host.log(`connectPatternLibrary: received message without resolveable app: ${m}`);
			return;
		}

		const project = await dataHost.getProject(m.payload.projectId);

		if (!project) {
			host.log(`connectPatternLibrary: received message without resolveable project: ${m}`);
			return;
		}

		const path = await host.selectFile({
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

		const ids = await dataHost.getConnections(project);

		const previousLibrary = m.payload.library
			? project.getPatternLibraryById(m.payload.library)
			: project.getPatternLibraries().find(p => ids.some(id => id === p.getId()));

		if (m.payload.library && !previousLibrary) {
			return;
		}

		const analysisResult = await performAnalysis(path, { previousLibrary });

		if (analysisResult.type === T.LibraryAnalysisResultType.Error) {
			app.send({
				type: MessageType.ShowError,
				id: uuid.v4(),
				payload: {
					message: 'Sorry, this seems to be an incompatible library.',
					detail: 'Learn more about supported component libraries on github.com/meetalva',
					help: 'https://github.com/meetalva/alva#pattern-library-requirements',
					error: {
						message: analysisResult.error.message,
						stack: analysisResult.error.stack || ''
					}
				}
			});
			return;
		}

		if (!previousLibrary) {
			app.send({
				type: M.MessageType.ConnectPatternLibraryResponse,
				id: m.id,
				payload: {
					analysis: analysisResult.result,
					path,
					previousLibraryId: undefined
				}
			});
		} else {
			app.send({
				type: M.MessageType.UpdatePatternLibraryResponse,
				id: m.id,
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
): Promise<T.LibraryAnalysisResult> {
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
