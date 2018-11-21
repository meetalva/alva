import * as M from '../../message';
import * as Model from '../../model';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function pastePage({ store }: MessageHandlerContext): MessageHandler<M.PastePage> {
	return m => {
		if (store.getApp().getHasFocusedInput()) {
			return;
		}

		const project = store.getProject();

		if (!project) {
			return;
		}

		const senders = m.sender || [];

		if (!senders.includes(store.getSender().id)) {
			return;
		}

		const pages = store.getPages();
		const activePage = (store.getActivePage() || pages[pages.length - 1]) as Model.Page;

		const contextProject = m.payload.project
			? Model.Project.from(m.payload.project)
			: store.getProject();

		const sourcePage = Model.Page.from(m.payload.page, { project: contextProject });

		const clonedPage = sourcePage.clone();

		project.importPage(clonedPage);
		store.commit();

		project.movePageAfter({
			page: clonedPage,
			targetPage: activePage
		});

		project.setActivePage(clonedPage);
	};
}
