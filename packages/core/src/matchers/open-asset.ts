import * as M from '../message';
import * as MimeTypes from 'mime-types';
import { MatcherCreator } from './context';

export const openAsset: MatcherCreator<M.AssetReadRequest> = ({ host }) => {
	return async m => {
		const app = await host.getApp(m.appId || '');

		if (!app) {
			host.log(`openAsset: received message without resolveable app: ${m}`);
			return;
		}

		const selectedPath = await host.selectFile({
			title: 'Select an image',
			properties: ['openFile'],
			filters: [
				{
					name: 'Image',
					extensions: ['png', 'jpg', 'jpeg', 'svg']
				}
			]
		});

		if (!selectedPath) {
			return;
		}

		try {
			const { buffer } = await host.readFile(selectedPath);
			const mimeType = MimeTypes.lookup(selectedPath) || 'application/octet-stream';

			app.send({
				transaction: m.transaction,
				type: M.MessageType.AssetReadResponse,
				id: m.id,
				payload: `data:${mimeType};base64,${buffer.toString('base64')}`
			});
		} catch (err) {
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
	};
};
