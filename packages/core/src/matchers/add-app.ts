import * as M from '../message';
import * as T from '../types';
import * as Model from '../model';

export function addApp({ host }: T.MatcherContext): T.Matcher<M.ChangeApp> {
	return async message => {
		host.addApp(Model.AlvaApp.from(message.payload.app, { sender: await host.getSender() }));
	};
}
