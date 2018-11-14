import * as Message from '../../message';
import * as Types from '../../types';

export function save(server: Types.AlvaServer): (message: Message.Save) => Promise<void> {
	return async message => {
		// TODO: Reimplement
	};
}
