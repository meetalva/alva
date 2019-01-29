import * as T from '@meetalva/types';
import * as Model from '../model';
import * as M from '../message';

export type MatcherContext = T.MatcherContext<Model.AlvaApp<M.Message>, Model.Project, M.Message>;
export type Matcher<M extends M.Message> = (m: M) => Promise<void>;
export type MatcherCreator<M extends M.Message, C = unknown> = (
	context: MatcherContext,
	config?: C
) => Matcher<M>;
