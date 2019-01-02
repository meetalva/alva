import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function projectRecordsChanged({
	store
}: MessageHandlerContext): MessageHandler<M.ProjectRecordsChanged> {
	return m => {
		store.setProjects(m.payload.projects);
	};
}
