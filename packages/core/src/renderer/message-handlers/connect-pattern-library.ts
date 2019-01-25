import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Types from '../../types';
import * as uuid from 'uuid';
import { PatternLibrary } from '../../model';
import * as T from '../../types';

export function connectPatternLibrary({
	store
}: MessageHandlerContext): MessageHandler<M.ConnectPatternLibraryResponse> {
	return m => {
		const project = store.getProject();

		if (!project) {
			return;
		}

		if (m.payload.result === 'aborted') {
			const library = m.payload.previousLibraryId
				? project.getPatternLibraryById(m.payload.previousLibraryId)
				: undefined;

			if (library) {
				library.setState(T.PatternLibraryState.Disconnected);
			}

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
