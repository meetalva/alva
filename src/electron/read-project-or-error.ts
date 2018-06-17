import * as Path from 'path';
import { Persistence, PersistenceState } from '../persistence';
import { showError } from './show-error';
import * as Types from '../types';

export const readProjectOrError = async <T>(
	path: string
): Promise<Types.SavedProject | undefined> => {
	const result = await Persistence.read<Types.SavedProject>(path);

	if (result.state === PersistenceState.Error) {
		result.error.message = [
			`Sorry, we had trouble opening the file "${Path.basename(path)}".`,
			result.error.message
		].join('\n');
		showError(result.error);
		return;
	}

	return result.contents;
};
