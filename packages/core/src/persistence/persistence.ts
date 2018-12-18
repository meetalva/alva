import * as Yaml from 'js-yaml';
import * as Types from '../types';

export class Persistence {
	public static async parse<T>(contents: string): Promise<Types.PersistenceParseResult<T>> {
		try {
			return {
				state: Types.PersistenceState.Success,
				contents: (Yaml.load(String(contents)) as unknown) as T
			};
		} catch (error) {
			return {
				state: Types.PersistenceState.Error,
				error
			};
		}
	}

	// tslint:disable-next-line:no-any
	public static async serialize(model: any): Promise<Types.PersistenceSerializeResult> {
		try {
			return {
				state: Types.PersistenceState.Success,
				contents: Yaml.safeDump(model.toDisk(), { skipInvalid: true, noRefs: true })
			};
		} catch (error) {
			return {
				state: Types.PersistenceState.Error,
				error
			};
		}
	}
}
