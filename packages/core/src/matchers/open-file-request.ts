import * as M from '../message';
import * as T from '@meetalva/types';
import { MatcherCreator } from './context';

type Interceptor = (path: string) => Promise<boolean>;

export const openFileRequest: MatcherCreator<M.OpenFileRequest, Interceptor> = (
	{ host },
	intercept?: Interceptor
) => {
	return async m => {
		const sender = (await host.getApp(m.appId || '')) || (await host.getSender());

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

		if (typeof intercept === 'function' && (await intercept(selectedPath))) {
			return;
		}

		try {
			const { contents } = await host.readFile(selectedPath);

			const s = await host.getSender();
			const response = await s.transaction<M.UseFileRequest, M.UseFileResponse>(
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

				sender.send({
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

				sender.send({
					type: M.MessageType.OpenFileResponse,
					id: m.id,
					transaction: m.transaction,
					payload: p,
					sender: m.sender
				});
			}
		} catch (err) {
			Electron.dialog.showMessageBox({
				message: JSON.stringify(err)
			});
			if (!silent) {
				sender.send({
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
