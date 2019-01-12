import * as M from '../message';
import { MessageType } from '../message';
import * as T from '../types';
import * as uuid from 'uuid';
import { performAnalysis } from './perform-analysis';

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
			host.log(`connectPatternLibrary: no path`);
			return;
		}

		const connections = await dataHost.getConnections(project);
		const connection = connections.find(c => c.path === path);

		const previousLibrary = connection
			? project
					.getPatternLibraries()
					.find(p => `${p.getName()}@${p.getVersion()}` === connection.id)
			: m.payload.library
				? project.getPatternLibraryById(m.payload.library)
				: undefined;

		if (m.payload.library && !previousLibrary) {
			host.log(`connectPatternLibrary: could not determine previous library`);
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

		const analysis = analysisResult.result;

		dataHost.addConnection(project, {
			id: `${analysisResult.result.name}@${analysisResult.result.version}`,
			path: analysis.path
		});

		if (!previousLibrary) {
			app.send({
				type: M.MessageType.ConnectPatternLibraryResponse,
				id: m.id,
				transaction: m.transaction,
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
				transaction: m.transaction,
				payload: {
					analysis: analysisResult.result,
					path,
					previousLibraryId: previousLibrary.getId()
				}
			});
		}
	};
}
