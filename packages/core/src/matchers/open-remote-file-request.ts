import * as fetch from 'isomorphic-fetch';
import * as M from '../message';
import * as T from '../types';
import { Persistence } from '../persistence/persistence';

export function openRemoteFileRequest({
	host
}: T.MatcherContext): T.Matcher<M.OpenRemoteFileRequest> {
	return async m => {
		const sender = (await host.getApp(m.appId || '')) || (await host.getSender());
		const response = await fetch(m.payload.url);

		console.log(response);

		if (!response.ok) {
			sender.send({
				type: M.MessageType.ShowError,
				transaction: m.transaction,
				id: m.id,
				payload: {
					message: `Could not load Alva file from ${m.payload.url}`,
					detail: `The server responsed with ${response.status}: ${response.statusText}`
				}
			});
		}

		const downloadedProject = await response.text();

		console.log('!!!');

		sender.send({
			type: M.MessageType.UseFileRequest,
			id: m.id,
			transaction: m.transaction,
			sender: m.sender,
			payload: {
				silent: false,
				replace: false,
				contents: downloadedProject
			}
		});
	};
}
