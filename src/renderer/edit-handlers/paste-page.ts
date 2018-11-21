import * as M from '../../message';
import * as Model from '../../model';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Types from '../../types';
import * as uuid from 'uuid';

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

		const missingLibraries = sourcePage
			.getLibraryDependencies()
			.filter(lib => lib.getOrigin() === Types.PatternLibraryOrigin.UserProvided)
			.filter(lib => !project.getPatternLibraryByContextId(lib.contextId));

		if (missingLibraries.length > 0) {
			store.getSender().send({
				type: M.MessageType.ShowError,
				id: uuid.v4(),
				payload: {
					message: `Could not paste page "${sourcePage.getName()}"`,
					stack: [
						`Page "${sourcePage.getName()}" requires the following pattern libraries to be connected`,
						'',
						...missingLibraries.map(l => `- ${l.getName()}@${l.getVersion()}`)
					].join('\n')
				}
			});
			return;
		}

		const clonedPage = sourcePage.clone({ target: project, withState: true });

		project.importPage(clonedPage);
		store.commit();

		project.movePageAfter({
			page: clonedPage,
			targetPage: activePage
		});

		project.setActivePage(clonedPage);
	};
}
