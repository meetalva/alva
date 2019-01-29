import * as M from '@meetalva/message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function changeUserStore({
	store
}: MessageHandlerContext): MessageHandler<M.ChangeUserStore> {
	return m => {
		const project = store.getProject();

		if (!project || project.getId() !== m.payload.projectId) {
			return;
		}

		project.getUserStore().sync(m, { withEnhancer: false });
	};
}
