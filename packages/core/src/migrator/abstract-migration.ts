import * as Types from '../types';

export interface MigrationStep {
	inputVersion: number;
	outputVersion: number;
	description: string;
}

export interface MigrationItem<T> {
	project: T;
	steps: MigrationStep[];
}

export abstract class AbstractMigration<
	T extends Types.MigratableProject,
	V extends Types.MigratableProject
> {
	public readonly inputVersion: number = 0;
	public readonly outputVersion: number = 0;

	public async transform(input: MigrationItem<T>): Promise<MigrationItem<V>> {
		throw new Error(
			`Migration.transform is not implemented for ${this.inputVersion} => ${this.outputVersion}`
		);
	}
}
