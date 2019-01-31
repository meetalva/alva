import * as M from '@meetalva/message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function save({ store }: MessageHandlerContext): MessageHandler<M.SaveResult> {
	return m => {
		const project = store.getProject();

		if (project.getId() !== m.payload.previous) {
			return;
		}

		const previousDraft = project.getDraft();

		project.setPath(m.payload.project.path);
		project.setId(m.payload.project.id);
		project.setName(m.payload.project.name);
		project.setDraft(m.payload.project.draft);

		if (previousDraft !== project.getDraft()) {
			store.commit();
		}
	};
}
