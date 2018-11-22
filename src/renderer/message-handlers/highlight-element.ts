import * as M from '../../message';
import * as Mobx from 'mobx';
import * as Model from '../../model';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Types from '../../types';

export function highlightElement({
	store
}: MessageHandlerContext): MessageHandler<M.HighlightElement> {
	return m => {
		console.log(m);
		Mobx.runInAction(Types.ActionName.MatchHighlightedElement, () => {
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

			store.setHighlightedElement(previousEl, { flat: !store.getMetaDown() });
		});
	};
}
