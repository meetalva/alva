import * as Types from '@meetalva/types';
import * as Model from '@meetalva/model';
import * as M from '@meetalva/message';

export type ServerContext = Types.AlvaServer<Model.AlvaApp<M.Message>, Model.Project, M.Message>;
