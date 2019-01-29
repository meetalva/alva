import * as M from '../message';
import * as Model from '../model';
import { MatcherCreator } from './context';

export const addApp: MatcherCreator<M.ChangeApp> = ({ host }) => {
	return async message => {
		host.addApp(Model.AlvaApp.from(message.payload.app, { sender: await host.getSender() }));
	};
}
