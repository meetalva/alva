import * as T from '../types';
import { AbstractMigration, MigrationItem } from './abstract-migration';

export type OneTwoMigrationInput = MigrationItem<T.VersionOneSerializedProject>;
export type OneTwoMigrationOutput = MigrationItem<T.VersionTwoSerializedProject>;

export class OneTwoMigration
	implements AbstractMigration<T.VersionOneSerializedProject, T.VersionTwoSerializedProject> {
	public readonly inputVersion = 1;
	public readonly outputVersion = 2;

	public async transform(item: OneTwoMigrationInput): Promise<OneTwoMigrationOutput> {
		const { project } = item;

		const patternLibraries = project.patternLibraries.map(library => {
			const { name, description, version, ...transfer } = library;
			return {
				...transfer,
				packageFile: {
					description,
					name,
					version: version.toString()
				}
			};
		});

		return {
			steps: item.steps,
			project: {
				...project,
				patternLibraries,
				version: 2
			}
		};
	}
}
