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

						const { name, description, version, ...transfer } = library;

						const mappedName = name === 'meetalva-designkit' ? '@meetalva/designkit' : name;

						return {
							...transfer,
							packageFile: {
								...lib.packageFile,
								name: mappedName,
								version: version ? version.toString() : undefined,
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
