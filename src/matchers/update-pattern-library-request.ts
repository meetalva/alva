import * as M from '../message';
// import { MessageType } from '../message';
import * as T from '../types';
// import * as Model from '../model';
// import * as uuid from 'uuid';
// import * as Analyzer from '../analyzer';

// import { performAnalysis } from './perform-analysis';

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
			return;
		}
		// const connections = await dataHost.getConnections(project);
		// console.log(connections, '********* this is the library');
	};
}
