import * as M from '../message';
import { MatcherCreator } from './context';

export const openExternalUrl: MatcherCreator<M.OpenExternalURL> = ({ host }) => {
	return async message => host.open(message.payload);
}
