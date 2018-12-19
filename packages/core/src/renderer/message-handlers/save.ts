import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Model from '../../model';

export function save({ store }: MessageHandlerContext): MessageHandler<M.SaveResult> {
	return m => {
		const project = store.getProject();

		if (project.getId() !== m.payload.previous) {
			return;
		}

		const previousDraft = project.getDraft();
		const nextProject = Model.Project.from(m.payload.project);

		project.setPath(nextProject.getPath());
		project.setId(nextProject.getId());
		project.setName(nextProject.getName());

		project.setDraft(nextProject.getDraft());

		if (previousDraft !== project.getDraft()) {
			store.commit();
		}
	};
}
