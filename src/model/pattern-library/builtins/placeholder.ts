import { Pattern } from '../../pattern';
import { BuiltInContext, BuiltInResult } from '../pattern-library';
import * as PatternProperty from '../../pattern-property';
import * as Types from '../../types';

const PATTERN_CONTEXT_ID = 'synthetic:placeholder';
const SRC_CONTEXT_ID = 'src';

export const Placeholder = (context: BuiltInContext): BuiltInResult => {
	const patternId = context.options.getGlobalPatternId(PATTERN_CONTEXT_ID);

	const properties = [
		new PatternProperty.PatternAssetProperty({
			contextId: SRC_CONTEXT_ID,
			id: context.options.getGlobalPropertyId(patternId, SRC_CONTEXT_ID),
			label: 'Source',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'src'
		}),
		new PatternProperty.PatternStringProperty({
			label: 'Width',
			propertyName: 'width'
		}),
		new PatternProperty.PatternStringProperty({
			label: 'Height',
			propertyName: 'height'
		}),
		new PatternProperty.PatternStringProperty({
			label: 'Min Width',
			propertyName: 'minWidth'
		}),
		new PatternProperty.PatternStringProperty({
			label: 'Min Height',
			propertyName: 'minHeight'
		}),
		new PatternProperty.PatternStringProperty({
			label: 'Max Width',
			propertyName: 'maxWidth'
		}),
		new PatternProperty.PatternStringProperty({
			label: 'Max Height',
			propertyName: 'maxHeight'
		})
	];

	const pattern = new Pattern(
		{
			contextId: PATTERN_CONTEXT_ID,
			exportName: 'default',
			id: patternId,
			name: 'Placeholder',
			origin: Types.PatternOrigin.BuiltIn,
			propertyIds: properties.map(p => p.getId()),
			slots: [],
			type: Types.PatternType.SyntheticPlaceholder
		},
		context
	);

	return {
		pattern,
		properties
	};
};
