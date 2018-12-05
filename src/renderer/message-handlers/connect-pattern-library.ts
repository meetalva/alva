import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Types from '../../types';
import * as uuid from 'uuid';

export function connectPatternLibrary({
	store
}: MessageHandlerContext): MessageHandler<M.ConnectPatternLibraryResponse> {
	return m => {
		const project = store.getProject();

		if (!project) {
			return;
		}

		const id = m.payload.previousLibraryId;
		if (!id) {
			return;
		}

		console.log(m.payload.previousLibraryId);
		// library.import(analysis, { project });
		// project.addPatternLibrary(library);
		store.getApp().setRightSidebarTab(Types.RightSidebarTab.ProjectSettings);
		store.commit();

		store.getSender().send({
			id: uuid.v4(),
			payload: {
				id,
				path: m.payload.path
			},
			type: M.MessageType.ConnectedPatternLibraryNotification
		});
	};
}
