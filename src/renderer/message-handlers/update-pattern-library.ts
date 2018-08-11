import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as uuid from 'uuid';

export function updatePatternLibrary({
	store
}: MessageHandlerContext): MessageHandler<M.UpdatePatternLibraryResponse> {
	return m => {
		const project = store.getProject();

		if (!project) {
			return;
		}

		const library = project.getPatternLibraryById(m.payload.previousLibraryId);

		if (!library) {
			return;
		}

		library.import(m.payload.analysis, { project });
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
