import * as M from '../message';
import * as T from '../types';
import * as uuid from 'uuid';
import * as Model from '../model';

export function useFileResponse({
	dataHost,
	host
}: T.MatcherContext): T.Matcher<M.UseFileResponse> {
	return async m => {
		const app = await host.getApp(m.appId || '');

		if (!app) {
			host.log(`useFileResponse: received message without resolveable app: ${m}`);
			return;
		}

		if (m.payload.project.status === T.ProjectPayloadStatus.Error) {
			return;
		}

		const p = m.payload.project as T.ProjectPayloadSuccess;
		const replacement = Model.Project.from(p.contents);

		if (!m.payload.replace) {
			app.send({
				id: uuid.v4(),
				type: M.MessageType.OpenWindow,
				payload: {
					view: T.AlvaView.PageDetail,
					projectId: replacement.getId()
				},
				transaction: m.transaction,
				sender: m.sender
			});
		}
	};
}
