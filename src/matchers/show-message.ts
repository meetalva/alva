import * as M from '../message';
import * as T from '../types';

export function showMessage({ host }: T.MatcherContext): T.Matcher<M.ShowMessage> {
	return async message => {
		const app = await host.getApp();
		const sender = app || (await host.getSender());
		const appId = message.appId || (app ? app.getId() : undefined);

		const button = await host.showMessage(message.payload);

		if (button && button.message) {
			sender.send({ ...button.message, appId });
		}
	};
}
