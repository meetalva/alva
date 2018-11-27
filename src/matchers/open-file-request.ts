import * as Model from '../model';
import * as M from '../message';
import * as T from '../types';
import * as uuid from 'uuid';

export function openFileRequest({ host }: T.MatcherContext): T.Matcher<M.OpenFileRequest> {
	return async m => {
		const app = await host.getApp(m.appId || '');

		if (!app) {
			host.log(`openFileRequest: received message without resolveable app: ${m}`);
			return;
		}

		const selectedPath =
			m.payload.path ||
			(await host.selectFile({
				title: 'Open Alva File',
				properties: ['openFile'],
				filters: [
					{
						name: 'Alva File',
						extensions: ['alva']
					}
				]
			}));

		const silent = m.payload && typeof m.payload.silent === 'boolean' ? m.payload.silent : false;

		if (!selectedPath) {
			return;
		}

		try {
			const { contents } = await host.readFile(selectedPath);

			const response = await app.transaction<M.UseFileRequest, M.UseFileResponse>(
				{
					type: M.MessageType.UseFileRequest,
					id: m.id,
					transaction: m.transaction,
					sender: m.sender,
					payload: {
						silent,
						path: selectedPath,
						replace: m.payload.replace,
						contents
					}
				},
				{ type: M.MessageType.UseFileResponse }
			);

			if (response.payload.project.status === T.ProjectPayloadStatus.Error) {
				const p = response.payload.project as T.ProjectPayloadError;

				app.send({
					type: M.MessageType.ShowError,
					transaction: m.transaction,
					id: m.id,
					payload: {
						message: [p.error.message].join('\n'),
						detail: p.error.stack || ''
					}
				});
			}

			if (response.payload.project.status === T.ProjectPayloadStatus.Ok) {
				const p = response.payload.project as T.ProjectPayloadSuccess;
				const project = Model.Project.from(p.contents);

				if (!m.payload.replace) {
					app.send({
						id: uuid.v4(),
						type: M.MessageType.OpenWindow,
						payload: {
							view: T.AlvaView.PageDetail,
							projectId: project.getId()
						},
						transaction: m.transaction,
						sender: m.sender
					});
				}

				app.send({
					type: M.MessageType.OpenFileResponse,
					id: m.id,
					transaction: m.transaction,
					payload: p,
					sender: m.sender
				});
			}
		} catch (err) {
			if (!silent) {
				app.send({
					type: M.MessageType.ShowError,
					transaction: m.transaction,
					id: m.id,
					payload: {
						message: [err.message].join('\n'),
						detail: err.stack || ''
					}
				});
			}
		}
	};
}
