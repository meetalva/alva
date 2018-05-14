import { languages } from './languages';
import { Pattern, SyntheticPatternType } from '../../pattern';
import {
	PatternBooleanProperty,
	PatternEnumProperty,
	PatternEnumPropertyOption
} from '../../pattern-property';
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
			label: 'Language',
			propertyName: 'lang',
			options,
			defaultValue: defaultLanguage ? defaultLanguage.getId() : undefined
		})
	];

	const pagePattern = new Pattern(
		{
			name: 'Page',
			path: '',
			type: SyntheticPatternType.SyntheticPage,
			propertyIds: pageProperties.map(p => p.getId())
		},
		context
	);

	return {
		pagePattern,
		pageProperties
	};
};
