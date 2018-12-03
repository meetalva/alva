import * as M from '../message';
import * as T from '../types';

export function showMessage({ host }: T.MatcherContext): T.Matcher<M.ShowMessage> {
	return async m => {
		const app = await host.getApp(m.appId || '');

		if (!app) {
			host.log(`showMessage: received message without resolveable app: ${m}`);
			return;
		}

		const button = await host.showMessage(m.payload);

		if (button && button.message) {
			app.send({ ...button.message, appId: app.getId() });
		}
	};
}
