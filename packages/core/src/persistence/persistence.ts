import * as Yaml from 'js-yaml';
import { Migrator } from '../migrator';
import * as Types from '../types';

export class Persistence {
	public static async parse<T extends Types.SerializedProject>(
		contents: string
	): Promise<Types.PersistenceParseResult<T>> {
		try {
			const parsed = (Yaml.load(String(contents)) as unknown) as T;
			const migrator = new Migrator();
			const migrated = (await migrator.migrate(parsed)) as T;

			return {
				state: Types.PersistenceState.Success,
				contents: migrated
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
