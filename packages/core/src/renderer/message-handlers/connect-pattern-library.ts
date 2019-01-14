import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Types from '../../types';
import * as uuid from 'uuid';
import { PatternLibrary } from '../../model';

export function connectPatternLibrary({
	store
}: MessageHandlerContext): MessageHandler<M.ConnectPatternLibraryResponse> {
	return m => {
		const project = store.getProject();

		if (!project) {
			return;
		}

		const library = PatternLibrary.fromAnalysis(
			m.payload.analysis,
			{ project },
			{ analyzeBuiltins: false }
		);

		project.addPatternLibrary(library);

		store.getApp().setRightSidebarTab(Types.RightSidebarTab.ProjectSettings);
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
