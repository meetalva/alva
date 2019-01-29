import * as M from '@meetalva/message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function activatePage({ store }: MessageHandlerContext): MessageHandler<M.ActivatePage> {
	return m => {
		const project = store.getProject();

		if (!project) {
			return;
		}

		const page = project.getPageById(m.payload.id);

		if (!page) {
			return;
		}

		page.setActive(true);
	};
}
