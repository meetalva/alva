import * as Types from '../types';
import { ZeroOneMigration } from './migration-v0-v1';
import { OneTwoMigration } from './migration-v1-v2';
import { MigrationStep } from './abstract-migration';

export class Migrator {
	private migrations = [new ZeroOneMigration(), new OneTwoMigration()];

	public async migrate(input: Types.MigratableProject): Promise<Types.SavedProject> {
		const inputVersion = typeof (input as any).version === 'undefined' ? 0 : 1;

		const migrating = this.migrations.filter(m => m.inputVersion >= inputVersion).reduce(
			async (previous, migration) => migration.transform((await previous) as any),
			Promise.resolve({
				project: input,
				steps: [] as MigrationStep[]
			})
		);

		return (await migrating).project as Types.SavedProject;
	}
}
