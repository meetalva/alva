import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function changeUserStore({
	store
}: MessageHandlerContext): MessageHandler<M.ChangeUserStore> {
	return m => {
		const project = store.getProject();

		if (!project || project.getId() !== m.payload.projectId) {
			return;
		}

		project.startBatch();
		project.getUserStore().sync(m, { withEnhancer: false });
		project.endBatch();
	};
}
