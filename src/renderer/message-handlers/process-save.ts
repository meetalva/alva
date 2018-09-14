import * as M from '../../message';
import * as Types from '../../types';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function processSave({
	store,
	app,
	history
}: MessageHandlerContext): MessageHandler<M.SaveResult> {
	return m => {
		const project = store.getProject();

		if (m.payload.result.state === Types.PersistenceState.Error) {
			// TODO: Indicate error
			return;
		}

		if (m.payload.result.state === Types.PersistenceState.Success) {
			const previousDraft = project.getDraft();

			project.setDraft(m.payload.draft);
			project.setName(m.payload.name);

			if (previousDraft !== m.payload.draft) {
				store.commit();
			}
		}
	};
}
