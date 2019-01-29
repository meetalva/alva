import * as Types from '@meetalva/types';
import * as Model from '../../model';
import * as M from '../../message';

export type ServerContext = Types.AlvaServer<Model.AlvaApp<M.Message>, Model.Project, M.Message>;
