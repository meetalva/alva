import { languages } from './languages';
import { Pattern, PatternSlot, SyntheticPatternType } from '../../pattern';
import {
	PatternBooleanProperty,
	PatternEnumProperty,
	PatternEnumPropertyOption
} from '../../pattern-property';
import * as Types from '../../types';
import * as uuid from 'uuid';

export const Page = context => {
	const options = languages.map(
		(language, index) =>
			new PatternEnumPropertyOption({
				id: uuid.v4(),
				name: language.name,
				ordinal: index,
				value: language.value
			})
	);

	const defaultLanguage = options.find(option => option.getValue() === 'en');

	const pageProperties = [
		new PatternBooleanProperty({
			label: 'Mobile Viewport',
			propertyName: 'viewport',
			defaultValue: true
		}),
		new PatternEnumProperty({
			defaultOptionId: defaultLanguage ? defaultLanguage.getId() : undefined,
			hidden: false,
			id: uuid.v4(),
			label: 'Language',
			options,
			propertyName: 'lang',
			required: false
		})
	];

	const pagePattern = new Pattern(
		{
			contextId: 'synthetic:page',
			exportName: 'default',
			name: 'Page',
			propertyIds: pageProperties.map(p => p.getId()),
			slots: [
				new PatternSlot({
					displayName: 'Children',
					propertyName: 'children',
					id: uuid.v4(),
					type: Types.SlotType.Children
				})
			],
			type: SyntheticPatternType.SyntheticPage
		},
		context
	);

	return {
		pagePattern,
		pageProperties
	};
};
