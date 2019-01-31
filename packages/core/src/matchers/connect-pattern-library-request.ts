import * as M from '@meetalva/message';
import { MessageType } from '@meetalva/message';
import * as T from '@meetalva/types';
import * as uuid from 'uuid';
import * as Anaylzer from '@meetalva/analyzer';
import { MatcherCreator } from './context';

export const connectPatternLibrary: MatcherCreator<M.ConnectPatternLibraryRequest> = ({
	host,
	dataHost
}) => {
	return async m => {
		const app = await host.getApp(m.appId || '');

		if (!app) {
			host.log(`connectPatternLibrary: received message without resolveable app: ${m}`);
			(await host.getSender()).send({
				type: M.MessageType.ConnectPatternLibraryResponse,
				id: m.id,
				transaction: m.transaction,
				payload: {
					result: 'aborted',
					previousLibraryId: m.payload.library
				}
			});
			return;
		}

		const project = await dataHost.getProject(m.payload.projectId);

		const abort = () => {
			app.send({
				type: M.MessageType.ConnectPatternLibraryResponse,
				id: m.id,
				transaction: m.transaction,
				payload: {
					result: 'aborted',
					previousLibraryId: m.payload.library
				}
			});
		};

		if (!project) {
			host.log(`connectPatternLibrary: received message without resolveable project: ${m}`);
			return abort();
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
			return abort();
		}

		const pkg = JSON.parse((await host.readFile(path)).contents);

		const previousLibraryByName =
			pkg && pkg.name ? project.getPatternLibraryByPackageName(pkg.name) : undefined;
		const previousLibraryById = m.payload.library
			? project.getPatternLibraryById(m.payload.library)
			: undefined;
		const previousLibrary = previousLibraryById || previousLibraryByName;

		if (previousLibrary) {
			app.send({
				type: MessageType.UpdatingPatternLibrary,
				id: uuid.v4(),
				transaction: m.transaction,
				payload: {
					libraryId: previousLibrary.getId()
				}
			});
		}

		const analysisResult = await Anaylzer.analyze(path);

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

			return abort();
		}

		const analysis = analysisResult.result;
		const analysisName = analysisResult.result.packageFile
			? (analysisResult.result.packageFile as { name?: string }).name || 'Library'
			: 'Library';
		const analysisVersion = analysisResult.result.packageFile
			? (analysisResult.result.packageFile as { version?: string }).version || '1.0.0'
			: '1.0.0';

		dataHost.addConnection(project, {
			id: `${analysisName}@${analysisVersion}`,
			path: analysis.path
		});

		if (!previousLibrary) {
			app.send({
				type: M.MessageType.ConnectPatternLibraryResponse,
				id: m.id,
				transaction: m.transaction,
				payload: {
					result: 'success',
					analysis: analysisResult.result,
					path,
					previousLibraryId: undefined,
					installType: T.PatternLibraryInstallType.Local
				}
			});
		} else {
			app.send({
				type: M.MessageType.UpdatePatternLibraryResponse,
				id: m.id,
				transaction: m.transaction,
				payload: {
					result: 'success',
					analysis: analysisResult.result,
					path,
					previousLibraryId: previousLibrary.getId(),
					installType: T.PatternLibraryInstallType.Local
				}
			});
		}
	};
};
