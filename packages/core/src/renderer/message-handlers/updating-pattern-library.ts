import * as M from '@meetalva/message';
import * as T from '@meetalva/types';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function updatingPatternLibrary({
	store
}: MessageHandlerContext): MessageHandler<M.UpdatingPatternLibrary> {
	return m => {
		const project = store.getProject();

		if (!project) {
			return;
		}

		const library = project.getPatternLibraryById(m.payload.libraryId);

		if (!library) {
			return;
		}

		library.setState(T.PatternLibraryState.Connecting);
	};
}
