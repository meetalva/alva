import * as M from '@meetalva/message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Types from '@meetalva/types';

export function duplicateElement({
	app,
	store
}: MessageHandlerContext): MessageHandler<M.DuplicateElement> {
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
				store.duplicateElementById(m.payload);
		}
	};
}
