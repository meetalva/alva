import * as T from '@meetalva/types';
import { AbstractMigration, MigrationItem } from './abstract-migration';
import * as _ from 'lodash';
import { IdHasher } from '@meetalva/analyzer';

export type TwoThreeMigrationInput = MigrationItem<T.VersionTwoSerializedProject>;
export type TwoThreeMigrationOutput = MigrationItem<T.VersionThreeSerializedProject>;

export class TwoThreeMigration
	implements AbstractMigration<T.VersionTwoSerializedProject, T.VersionThreeSerializedProject> {
	public readonly inputVersion = 2;
	public readonly outputVersion = 3;

	public async transform(item: TwoThreeMigrationInput): Promise<TwoThreeMigrationOutput> {
		const project = _.merge(item.project) as T.VersionTwoSerializedProject;

		const patternLibraries = project.patternLibraries.map(library => {
			library.patterns = library.patterns.map(pattern => {
				const id = IdHasher.getGlobalPatternId(pattern.contextId);

				pattern.propertyIds = pattern.propertyIds.map(propId => {
					const prop = library.patternProperties.find(pp => pp.id === propId)!;
					const newPropId = IdHasher.getGlobalPropertyId(id, prop.contextId);
					prop.id = newPropId;

					project.elements
						.filter(element => element.patternId === pattern.id)
						.forEach(element => {
							element.propertyValues = element.propertyValues.map(pv => {
								if (pv[0] !== propId) {
									return pv;
								}

								const oldElementPropertyId = [element.id, pv[0]].join('-');
								const newElementPropertyId = [element.id, newPropId].join('-');

								project.userStore.references.forEach(ref => {
									if (ref.elementPropertyId === oldElementPropertyId) {
										ref.elementPropertyId = newElementPropertyId;
									}
								});

								return [newPropId, pv[1]] as [string, unknown];
							});
						});

					return newPropId;
				});

				project.elements
					.filter(element => element.patternId === pattern.id)
					.forEach(element => (element.patternId = id));

				pattern.slots.forEach(slot => {
					project.elementContents
						.filter(content => content.slotId === slot.id)
						.forEach(content => {
							content.slotId = IdHasher.getGlobalSlotId(id, slot.contextId);
						});
				});

				return {
					...pattern,
					id
				};
			});

			return library;
		});

		return {
			steps: item.steps,
			project: {
				...project,
				patternLibraries,
				version: 3
			}
		};
	}
}
