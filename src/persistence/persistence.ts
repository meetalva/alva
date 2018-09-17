import * as Fs from 'fs';
import * as Yaml from 'js-yaml';
import * as Types from '../types';

export class Persistence {
	// tslint:disable-next-line:no-any
	public static persist(path: string, model: any): Promise<Types.PersistencePersistResult> {
		return new Promise((resolve, reject) => {
			Fs.writeFile(
				path,
				Yaml.safeDump(model.toDisk(), { skipInvalid: true, noRefs: true }),
				error => {
					if (error) {
						return resolve({
							state: Types.PersistenceState.Error,
							error
						});
					}
					resolve({
						state: Types.PersistenceState.Success
					});
				}
			);
		});
	}

	public static read<T>(path: string): Promise<Types.PersistenceReadResult<T>> {
		return new Promise(resolve => {
			Fs.readFile(path, (error, contents) => {
				if (error) {
					return resolve({
						state: Types.PersistenceState.Error,
						error
					});
				}

				try {
					resolve({
						state: Types.PersistenceState.Success,
						contents: (Yaml.load(String(contents)) as unknown) as T
					});
				} catch (error) {
					return resolve({
						state: Types.PersistenceState.Error,
						error
					});
				}
			});
		});
	}
}
