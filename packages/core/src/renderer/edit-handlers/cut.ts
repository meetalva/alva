import * as M from '@meetalva/message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Types from '@meetalva/types';

export function cut({ app, store }: MessageHandlerContext): MessageHandler<M.Cut> {
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
				store.removeSelectedElement();
				break;
			case Types.ItemType.Page:
				store.removeSelectedPage();
		}
	};
}
