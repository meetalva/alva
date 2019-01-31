import * as M from '@meetalva/message';
import { MatcherCreator } from './context';

export const openExternalUrl: MatcherCreator<M.OpenExternalURL> = ({ host }) => {
	return async message => host.open(message.payload);
};
