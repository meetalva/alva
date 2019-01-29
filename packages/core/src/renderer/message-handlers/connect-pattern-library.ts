import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as uuid from 'uuid';
import { PatternLibrary } from '../../model';
import * as T from '@meetalva/types';

export function connectPatternLibrary({
	store
}: MessageHandlerContext): MessageHandler<M.ConnectPatternLibraryResponse> {
	return m => {
		const project = store.getProject();

		if (!project) {
			return;
		}

		if (m.payload.result === 'aborted' && m.payload.previousLibraryId) {
			const library = project.getPatternLibraryById(m.payload.previousLibraryId);

			if (library) {
				library.setState(T.PatternLibraryState.Disconnected);
			}

			return;
		}

		if (m.payload.result === 'aborted') {
			store.libraryStore.withProgress.forEach(item => item.abort());
			store.libraryStore.recommendations.forEach(item => item.abort());

			return;
		}

		const library = PatternLibrary.fromAnalysis(m.payload.analysis, {
			analyzeBuiltins: false,
			project,
			installType: m.payload.installType
		});

		project.addPatternLibrary(library);
		store.commit();

		store.getSender().send({
			id: uuid.v4(),
			payload: {
				id: library.getId(),
				path: m.payload.path
			},
			type: M.MessageType.ConnectedPatternLibraryNotification
		});
	};
}
