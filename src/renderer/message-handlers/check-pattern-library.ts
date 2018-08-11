import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Types from '../../types';

export function checkPatternLibrary({
	store
}: MessageHandlerContext): MessageHandler<M.CheckLibraryResponse> {
	return m => {
		const project = store.getProject();

		if (!project) {
			return;
		}

		m.payload
			.map(check => ({ library: project.getPatternLibraryById(check.id), check }))
			.forEach(({ library, check }) => {
				if (typeof library === 'undefined') {
					return;
				}
				library.setState(
					check.connected
						? Types.PatternLibraryState.Connected
						: Types.PatternLibraryState.Disconnected
				);
			});
	};
}
