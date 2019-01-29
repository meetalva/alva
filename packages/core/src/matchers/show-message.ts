import * as M from '../message';
import * as T from '@meetalva/types';
import { MatcherCreator } from './context';

export const showMessage: MatcherCreator<M.ShowMessage> = ({ host }) => {
	return async m => {
		const app = await host.getApp(m.appId || '');

		if (!app && host.type !== T.HostType.Electron) {
			host.log(`showMessage: received message without resolveable app: ${m}`);
			return;
		}

		const sender = app || (await host.getSender());
		const button = await host.showMessage(m.payload);

		if (button && button.message) {
			sender.send({ ...button.message });
		}
	};
};
