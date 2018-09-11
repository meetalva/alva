import * as M from '../../message';
import * as Model from '../../model';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Types from '../../types';

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

		project.startBatch();

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

		const contextProject = m.payload.project
			? Model.Project.from(m.payload.project)
			: store.getProject();

		const sourceElement = Model.Element.from(m.payload.element, {
			project: contextProject
		});

		project.endBatch();

		const clonedElement = sourceElement.clone();

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

		store.commit();
		project.setSelectedElement(clonedElement);
	};
}
