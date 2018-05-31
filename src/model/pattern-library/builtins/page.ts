import { languages } from './languages';
import { Pattern, PatternSlot } from '../../pattern';
import { BuiltInContext, BuiltInResult } from '../pattern-library';
import {
	PatternBooleanProperty,
	PatternEnumProperty,
	PatternEnumPropertyOption
} from '../../pattern-property';
import * as Types from '../../types';

const PATTERN_CONTEXT_ID = 'synthetic:page';
const SLOT_CONTEXT_ID = 'children';
const VIEWPORT_CONTEXT_ID = 'viewport';
const LANG_CONTEXT_ID = 'lang';

export const Page = (context: BuiltInContext): BuiltInResult => {
	const patternId = context.options.getGlobalPatternId(PATTERN_CONTEXT_ID);
	const langEnumId = context.options.getGlobalPropertyId(patternId, LANG_CONTEXT_ID);

	const options = languages.map(
		(language, index) =>
			new PatternEnumPropertyOption({
				contextId: language.value,
				id: context.options.getGloablEnumOptionId(langEnumId, language.value),
				name: language.name,
				ordinal: index,
				value: language.value
			})
	);

	const defaultLanguage = options.find(option => option.getValue() === 'en');

	const properties = [
		new PatternBooleanProperty({
			contextId: VIEWPORT_CONTEXT_ID,
			description: 'Adapt viewport to device',
			id: context.options.getGlobalPropertyId(patternId, VIEWPORT_CONTEXT_ID),
			label: 'Mobile Viewport',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'viewport',
			defaultValue: true
		}),
		new PatternEnumProperty({
			contextId: LANG_CONTEXT_ID,
			defaultOptionId: defaultLanguage ? defaultLanguage.getId() : undefined,
			hidden: false,
			id: langEnumId,
			label: 'Language',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			options,
			propertyName: 'lang',
			required: false
		})
	];

	const pattern = new Pattern(
		{
			contextId: PATTERN_CONTEXT_ID,
			description: '',
			exportName: 'default',
			id: patternId,
			name: 'Page',
			origin: Types.PatternOrigin.BuiltIn,
			propertyIds: properties.map(p => p.getId()),
			slots: [
				new PatternSlot({
					contextId: 'children',
					displayName: 'Children',
					propertyName: 'children',
					id: context.options.getGlobalSlotId(patternId, SLOT_CONTEXT_ID),
					type: Types.SlotType.Children
				})
			],
			type: Types.PatternType.SyntheticPage
		},
		context
	);

	return {
		pattern,
		properties
	};
};
