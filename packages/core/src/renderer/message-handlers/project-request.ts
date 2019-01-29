import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Types from '@meetalva/types';

export function projectRequest({ store }: MessageHandlerContext): MessageHandler<M.ProjectRequest> {
	const app = store.getApp();

	return m => {
		const data = store.getProject();

		if (!data) {
			app.send({
				id: m.id,
				type: M.MessageType.ProjectResponse,
				payload: {
					data: undefined,
					status: Types.ProjectStatus.None
				}
			});

			return;
		}

		app.send({
			id: m.id,
			type: M.MessageType.ProjectResponse,
			transaction: m.transaction,
			payload: {
				data: data.toJSON(),
				status: Types.ProjectStatus.Ok
			}
		});
	};
}
