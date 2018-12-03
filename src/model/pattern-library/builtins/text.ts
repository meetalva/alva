import { Pattern } from '../../pattern';
import { BuiltInContext, BuiltInResult } from '../pattern-library';
import * as PatternProperty from '../../pattern-property';
import * as Types from '../../../types';

const PATTERN_CONTEXT_ID = 'synthetic:text';
const TEXT_CONTEXT_ID = 'text';

export const Text = (context: BuiltInContext): BuiltInResult => {
	const patternId = context.options.getGlobalPatternId(PATTERN_CONTEXT_ID);

	const properties = [
		new PatternProperty.PatternStringProperty({
			contextId: 'text',
			id: context.options.getGlobalPropertyId(patternId, TEXT_CONTEXT_ID),
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Text',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'text',
			defaultValue: 'Text'
		})
	];

	return {
		properties,
		pattern: new Pattern(
			{
				contextId: PATTERN_CONTEXT_ID,
				description: 'for Headlines, Copy and more',
				exportName: 'default',
				icon: 'Type',
				id: patternId,
				name: 'Text',
				origin: Types.PatternOrigin.BuiltIn,
				propertyIds: properties.map(p => p.getId()),
				slots: [],
				type: Types.PatternType.SyntheticText
			},
			context
		)
	};
};
