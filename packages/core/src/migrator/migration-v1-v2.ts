import * as T from '@meetalva/types';
import { AbstractMigration, MigrationItem } from './abstract-migration';

export type OneTwoMigrationInput = MigrationItem<T.VersionOneSerializedProject>;
export type OneTwoMigrationOutput = MigrationItem<T.VersionTwoSerializedProject>;

export class OneTwoMigration
	implements AbstractMigration<T.VersionOneSerializedProject, T.VersionTwoSerializedProject> {
	public readonly inputVersion = 1;
	public readonly outputVersion = 2;

	public async transform(item: OneTwoMigrationInput): Promise<OneTwoMigrationOutput> {
		const { project } = item;

		return {
			steps: item.steps,
			project: {
				...project,
				patternLibraries: project.patternLibraries.map(
					(library: T.SerializedPatternLibraryV1) => {
						const lib = library as any;

						if (typeof lib.packageFile === 'object') {
							return (library as unknown) as T.SerializedPatternLibraryV2;
						}

						const { name: rawName, description, version: rawVersion, ...transfer } = library;
						const name = rawName === 'meetalva-designkit' ? '@meetalva/designkit' : rawName;
						const version = typeof rawVersion === 'string' ? rawVersion : '1.0.0';

						return {
							...transfer,
							packageFile: {
								...lib.packageFile,
								name,
								version,
								description
							}
						};
					}
				),
				version: 2
			}
		};
	}
}
