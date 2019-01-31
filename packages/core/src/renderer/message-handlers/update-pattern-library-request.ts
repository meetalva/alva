import * as M from '@meetalva/message';
import * as T from '@meetalva/types';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function updatePatternLibraryRequest({
	store
}: MessageHandlerContext): MessageHandler<M.UpdatePatternLibraryRequest> {
	return m => {
		const project = store.getProject();

		if (!project) {
			return;
		}

		const library = project.getPatternLibraryById(m.payload.libId);

		if (!library) {
			return;
		}

		library.setState(T.PatternLibraryState.Connecting);
	};
}
