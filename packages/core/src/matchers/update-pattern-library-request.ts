import * as M from '../message';
import { MessageType as MT } from '../message';
import * as T from '../types';
import * as uuid from 'uuid';
import { performAnalysis } from './perform-analysis';
import { PatternLibraryInstallType } from '../types';

export function updatePatternLibrary({
	host,
	dataHost
}: T.MatcherContext): T.Matcher<M.UpdatePatternLibraryRequest> {
	return async m => {
		const { libId, projectId } = m.payload;
		const app = await host.getApp(m.appId || '');

		if (!app) {
			host.log(`updatePatternLibrary: received message without resolvable app: ${m}`);
			return;
		}

		const project = await dataHost.getProject(projectId);
		if (!project) {
			host.log(`connectPatternLibrary: received message without resolveable project: ${m}`);
			return;
		}

		const library = project.getPatternLibraryById(libId);

		if (!library) {
			host.log(`connectPatternLibrary: received message without resolveable library: ${m}`);
			return;
		}

		const connections = await dataHost.getConnections(project);
		const connection = connections.find(
			c => c.id === `${library.getName()}@${library.getVersion()}`
		);

		if (!connection || !await host.exists(connection.path)) {
			if (m.payload.installType === PatternLibraryInstallType.Local) {
				app.send({
					type: MT.ConnectPatternLibraryRequest,
					id: uuid.v4(),
					transaction: m.transaction,
					payload: {
						projectId: project.getId(),
						library: library ? library.getId() : undefined
					}
				});
			}

			if (library && m.payload.installType === PatternLibraryInstallType.Remote) {
				app.send({
					type: MT.ConnectNpmPatternLibraryRequest,
					id: uuid.v4(),
					transaction: m.transaction,
					payload: {
						projectId: project.getId(),
						npmId: library.getPackageName()
					}
				});
			}

			return;
		}

		const { path } = connection;
		const analysisResult = await performAnalysis(path, { previousLibrary: library });

		if (analysisResult.type === T.LibraryAnalysisResultType.Error) {
			app.send({
				type: MT.ShowError,
				id: uuid.v4(),
				transaction: m.transaction,
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

		app.send({
			type: M.MessageType.UpdatePatternLibraryResponse,
			id: m.id,
			transaction: m.transaction,
			payload: {
				result: 'success',
				analysis: analysisResult.result,
				path,
				previousLibraryId: library.getId(),
				installType: m.payload.installType
			}
		});
	};
}
