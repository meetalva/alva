import * as M from '../message';
import { MessageType } from '../message';
import * as T from '../types';
import { getPackage } from '../analyzer/get-package';
import * as uuid from 'uuid';
import { performAnalysis } from './perform-analysis';

export function connectNpmPatternLibrary({
	host,
	dataHost
}: T.MatcherContext): T.Matcher<M.ConnectNpmPatternLibraryRequest> {
	return async m => {
		const app = await host.getApp(m.appId || '');

		if (!app) {
			host.log(`connectNpmPatternLibrary: received message without resolveable app: ${m}`);
			return;
		}

		const project = await dataHost.getProject(m.payload.projectId);

		if (!project) {
			host.log(`connectNpmPatternLibrary: received message without resolveable project: ${m}`);
			return;
		}

		const previousLibrary = project.getPatternLibraryById(m.payload.libraryId);

		if (m.payload.libraryId && !previousLibrary) {
			host.log(`connectNpmPatternLibrary: could not determine previous library`);
			return;
		}

		const result = await getPackage(m.payload.npmId, {
			cwd: await host.resolveFrom(T.HostBase.AppData, 'packages')
		});

		if (result instanceof Error) {
			return app.send({
				type: MessageType.ShowError,
				id: uuid.v4(),
				payload: {
					message: 'Sorry, we could not fetch this package.',
					detail: result.message,
					error: {
						message: result.message,
						stack: result.stack || ''
					}
				}
			});
		}

		console.log(result);
		const analysisResult = await performAnalysis(result.path, { previousLibrary });

		if (analysisResult.type === T.LibraryAnalysisResultType.Error) {
			host.log(analysisResult.error.message);

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
					path: result.path,
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
					path: result.path,
					previousLibraryId: previousLibrary.getId()
				}
			});
		}
	};
}
