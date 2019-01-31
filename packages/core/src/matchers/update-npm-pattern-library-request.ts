import * as uuid from 'uuid';
import * as M from '@meetalva/message';
import { MessageType as MT } from '@meetalva/message';
import * as T from '@meetalva/types';
import * as Analyzer from '@meetalva/analyzer';
import { MatcherCreator } from './context';
import pkgDir = require('pkg-dir');

export const updateNpmPatternLibrary: MatcherCreator<M.UpdateNpmPatternLibraryRequest> = ({
	host,
	dataHost
}) => {
	return async m => {
		const { libId, projectId } = m.payload;
		const app = await host.getApp(m.appId || '');

		if (!app) {
			host.log(`updateNpmPatternLibrary: received message without resolvable app: ${m}`);
			return;
		}

		const abort = () => {
			app.send({
				type: M.MessageType.ConnectPatternLibraryResponse,
				id: m.id,
				transaction: m.transaction,
				payload: {
					result: 'aborted',
					previousLibraryId: m.payload.libId
				}
			});
		};

		const project = await dataHost.getProject(projectId);
		if (!project) {
			host.log(`updateNpmPatternLibrary: received message without resolveable project: ${m}`);
			return abort();
		}

		const previousLibrary = project.getPatternLibraryById(libId);

		if (!previousLibrary) {
			host.log(`updateNpmPatternLibrary: received message without resolveable library: ${m}`);
			return abort();
		}

		const dirname = await pkgDir(__dirname);

		if (dirname === null) {
			app.send({
				type: MT.ShowError,
				id: uuid.v4(),
				payload: {
					message: 'Sorry, we could not fetch this package.',
					detail: 'Could not determine pkg root',
					error: {
						message: 'Could not determine pkg root',
						stack: ''
					}
				}
			});

			return abort();
		}

		const result = await Analyzer.getPackage(
			m.payload.npmId || previousLibrary.getPackageName(),
			{
				cwd: await host.resolveFrom(T.HostBase.AppData, 'packages'),
				dirname,
				appPath: await host.resolveFrom(T.HostBase.AppPath, '.')
			}
		);

		if (result instanceof Error) {
			abort();
			return app.send({
				type: MT.ShowError,
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

		const analysisResult = await Analyzer.analyze(result.path);

		if (analysisResult.type === T.LibraryAnalysisResultType.Error) {
			host.log(analysisResult.error.message);

			app.send({
				type: MT.ShowError,
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

		app.send({
			type: M.MessageType.UpdatePatternLibraryResponse,
			id: m.id,
			transaction: m.transaction,
			payload: {
				result: 'success',
				analysis: analysisResult.result,
				path: result.path,
				previousLibraryId: previousLibrary.getId(),
				installType: T.PatternLibraryInstallType.Remote
			}
		});
	};
};
