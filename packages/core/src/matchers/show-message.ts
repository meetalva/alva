import * as M from '../message';
import * as T from '../types';

export function showMessage({ host }: T.MatcherContext): T.Matcher<M.ShowMessage> {
	return async m => {
		const app = await host.getApp(m.appId || '');

		if (!app && host.type !== T.HostType.Electron) {
			host.log(`showMessage: received message without resolveable app: ${m}`);
			return;
		}

		const sender = app || (await host.getSender());
		const button = await host.showMessage(m.payload);
		const result =
			typeof button.message === 'function' ? button.message({ checked: false }) : button.message;

		if (button && button.message) {
			const msgs = Array.isArray(result) ? result : [result];
			msgs.forEach(m => sender.send(m));
		}
	};
}
