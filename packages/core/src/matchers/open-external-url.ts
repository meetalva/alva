import * as M from '../message';
import * as T from '../types';

export function openExternalUrl({ host }: T.MatcherContext): T.Matcher<M.OpenExternalURL> {
	return async message => host.open(message.payload);
}
