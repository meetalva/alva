import * as M from '@meetalva/message';
import * as Model from '@meetalva/model';
import { MatcherCreator } from './context';

export const addApp: MatcherCreator<M.ChangeApp> = ({ host }) => {
	return async message => {
		host.addApp(Model.AlvaApp.from(message.payload.app, { sender: await host.getSender() }));
	};
};
