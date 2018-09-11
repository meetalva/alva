import * as M from '../../message';
import * as Model from '../../model';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function selectElement({ store }: MessageHandlerContext): MessageHandler<M.SelectElement> {
	return m => {
		const project = store.getProject();

		if (!project) {
			return;
		}

		if (!m.payload.element) {
			return;
		}

		const el = Model.Element.from(m.payload.element, { project });
		const previousEl = project.getElementById(el.getId());

		if (!previousEl) {
			return;
		}

		store.setSelectedElement(previousEl);
	};
}
