import { languages } from './languages';
import { Pattern, SyntheticPatternType } from '../pattern';
import {
	PatternBooleanProperty,
	PatternEnumProperty,
	PatternEnumPropertyOption
} from '../pattern-property';
import * as uuid from 'uuid';

export const Page = () =>
	new Pattern({
		name: 'Page',
		path: '',
		type: SyntheticPatternType.SyntheticPage,
		properties: [
			new PatternBooleanProperty({
				label: 'Mobile Viewport',
				propertyName: 'viewport'
			}),
			new PatternEnumProperty({
				label: 'Language',
				propertyName: 'lang',
				options: languages.map(
					(language, index) =>
						new PatternEnumPropertyOption({
							id: uuid.v4(),
							name: language.name,
							ordinal: index,
							value: language.value
						})
				)
			})
		]
	});
