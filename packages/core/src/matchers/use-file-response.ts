import * as M from '@meetalva/message';
import * as T from '@meetalva/types';
import * as uuid from 'uuid';
import * as Model from '@meetalva/model';
import { MatcherCreator } from './context';

export const useFileResponse: MatcherCreator<M.UseFileResponse> = ({ host }) => {
	return async m => {
		const sender = (await host.getApp(m.appId || '')) || (await host.getSender());

		if (m.payload.project.status === T.ProjectPayloadStatus.Error) {
			host.log('useFileResponse: Received project payload with error status');
			return;
		}

		const p = m.payload.project as T.ProjectPayloadSuccess;
		const replacement = Model.Project.from(p.contents);

		if (!m.payload.replace) {
			sender.send({
				id: uuid.v4(),
				type: M.MessageType.OpenWindow,
				payload: {
					view: T.AlvaView.PageDetail,
					projectId: replacement.getId()
				},
				transaction: m.transaction,
				sender: m.sender
			});
		} else {
			host.log(
				'useFileResponse: Received project payload with replace parameter "true", skipping'
			);
		}
	};
};
