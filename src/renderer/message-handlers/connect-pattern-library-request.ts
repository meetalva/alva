import * as M from '../../message';
import * as T from '../../types';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function connectPatternLibraryRequest({
	store
}: MessageHandlerContext): MessageHandler<M.ConnectPatternLibraryRequest> {
	return m => {
		const project = store.getProject();

		if (!project) {
			return;
		}

		if (!m.payload.library) {
			return;
		}

		const library = project.getPatternLibraryById(m.payload.library);

		if (!library) {
			return;
		}

		library.setState(T.PatternLibraryState.Connecting);
	};
}
