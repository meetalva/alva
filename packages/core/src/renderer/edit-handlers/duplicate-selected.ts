import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Types from '../../types';

export function duplicateSelected({
	app,
	store
}: MessageHandlerContext): MessageHandler<M.DuplicateSelected> {
	return m => {
		if (app.getHasFocusedInput()) {
			return;
		}

		const project = store.getProject();

		if (!project) {
			return;
		}

		switch (project.getFocusedItemType()) {
			case Types.ItemType.Element:
				store.duplicateSelectedElement();
				break;
			case Types.ItemType.Page:
				store.duplicateActivePage();
		}
	};
}
