import * as T from '@meetalva/types';
import * as Mo from '@meetalva/model';
import { Message } from '@meetalva/message';

export type MenuContext = T.MenuContext<Mo.AlvaApp<Message>, Mo.Project>;
export type MenuCreator = (ctx: MenuContext) => T.MenuItem<Mo.AlvaApp<Message>, Mo.Project>;
