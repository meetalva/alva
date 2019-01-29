import * as M from '../../message';
import * as Model from '../../model';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Types from '@meetalva/types';
import * as uuid from 'uuid';

export function pasteElement({
	app,
	store
}: MessageHandlerContext): MessageHandler<M.PasteElement> {
	return m => {
		if (app.getHasFocusedInput()) {
			return;
		}

		const project = store.getProject();

		if (!project) {
			return;
		}

		const activePage = store.getActivePage() as Model.Page;

		if (!activePage) {
			return;
		}

		const targetElement = m.payload.targetId
			? store.getElementById(m.payload.targetId)
			: store.getSelectedElement() || activePage.getRoot();

		if (!targetElement) {
			return;
		}

		const contextProject = Model.Project.from(m.payload.project);
		const sourceElement = Model.Element.from(m.payload.element, { project: contextProject });

		const missingLibraries = sourceElement
			.getLibraryDependencies()
			.filter(lib => lib.getOrigin() === Types.PatternLibraryOrigin.UserProvided)
			.filter(lib => !project.getPatternLibraryByContextId(lib.contextId));

		if (missingLibraries.length > 0) {
			store.getSender().send({
				type: M.MessageType.ShowError,
				id: uuid.v4(),
				payload: {
					message: `Could not paste element "${sourceElement.getName()}"`,
					detail: [
						`Element "${sourceElement.getName()}" requires the following pattern libraries to be connected`,
						'',
						...missingLibraries.map(l => `- ${l.getName()}@${l.getVersion()}`)
					].join('\n')
				}
			});
			return;
		}

		const clonedElement = sourceElement.clone({ target: project, withState: true });
		project.importElement(clonedElement);

		switch (m.payload.targetType) {
			case Types.ElementTargetType.Inside:
				if (targetElement.acceptsChildren()) {
					store.insertElementInside({
						element: clonedElement,
						targetElement
					});
				}
				break;
			case Types.ElementTargetType.Auto:
			case Types.ElementTargetType.Below:
				store.insertElementAfter({
					element: clonedElement,
					targetElement
				});
		}

		project.setSelectedElement(clonedElement);
		store.commit();
	};
}
