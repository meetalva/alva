import * as Mobx from 'mobx';
import * as M from '../../message';
import * as T from '../../types';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as uuid from 'uuid';

export function updatePatternLibrary({
	store
}: MessageHandlerContext): MessageHandler<M.UpdatePatternLibraryResponse> {
	return Mobx.action((m: M.UpdatePatternLibraryResponse) => {
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
		}

		if (m.payload.result === 'success') {
			const library = project.getPatternLibraryById(m.payload.previousLibraryId);

			if (!library) {
				return;
			}

			library.import(m.payload.analysis, { project });
			library.setState(T.PatternLibraryState.Connected);
			library.setInstallType(m.payload.installType);

			store.commit();

			store.getSender().send({
				id: uuid.v4(),
				payload: {
					id: library.getId(),
					path: m.payload.path
				},
				type: M.MessageType.ConnectedPatternLibraryNotification
			});
		}
	});
}
