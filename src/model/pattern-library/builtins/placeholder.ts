import { Pattern } from '../../pattern';
import { BuiltInContext, BuiltInResult } from '../pattern-library';
import * as PatternProperty from '../../pattern-property';
import * as Types from '../../types';

const PATTERN_CONTEXT_ID = 'synthetic:placeholder';
const SRC_CONTEXT_ID = 'src';
const WIDTH_CONTEXT_ID = 'width';
const HEIGHT_CONTEXT_ID = 'height';
const MIN_WIDTH_CONTEXT_ID = 'min-width';
const MAX_WIDTH_CONTEXT_ID = 'max-width';
const MIN_HEIGHT_CONTEXT_ID = 'min-height';
const MAX_HEIGHT_CONTEXT_ID = 'max-height';

export const Placeholder = (context: BuiltInContext): BuiltInResult => {
	const patternId = context.options.getGlobalPatternId(PATTERN_CONTEXT_ID);

	const properties = [
		new PatternProperty.PatternAssetProperty({
			contextId: SRC_CONTEXT_ID,
			description: 'Lorem ipsum',
			id: context.options.getGlobalPropertyId(patternId, SRC_CONTEXT_ID),
			label: 'Source',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'src'
		}),
		new PatternProperty.PatternStringProperty({
			contextId: WIDTH_CONTEXT_ID,
			id: context.options.getGlobalPropertyId(patternId, WIDTH_CONTEXT_ID),
			label: 'Width',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'width'
		}),
		new PatternProperty.PatternStringProperty({
			contextId: HEIGHT_CONTEXT_ID,
			id: context.options.getGlobalPropertyId(patternId, HEIGHT_CONTEXT_ID),
			label: 'Height',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'height'
		}),
		new PatternProperty.PatternStringProperty({
			contextId: MIN_WIDTH_CONTEXT_ID,
			id: context.options.getGlobalPropertyId(patternId, MIN_WIDTH_CONTEXT_ID),
			label: 'Min Width',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'minWidth'
		}),
		new PatternProperty.PatternStringProperty({
			contextId: MIN_HEIGHT_CONTEXT_ID,
			description: 'The Height should be minimum this size.',
			id: context.options.getGlobalPropertyId(patternId, MIN_HEIGHT_CONTEXT_ID),
			label: 'Min Height',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'minHeight'
		}),
		new PatternProperty.PatternStringProperty({
			contextId: MAX_WIDTH_CONTEXT_ID,
			id: context.options.getGlobalPropertyId(patternId, MAX_WIDTH_CONTEXT_ID),
			label: 'Max Width',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'maxWidth'
		}),
		new PatternProperty.PatternStringProperty({
			contextId: MAX_HEIGHT_CONTEXT_ID,
			id: context.options.getGlobalPropertyId(patternId, MAX_HEIGHT_CONTEXT_ID),
			label: 'Max Height',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'maxHeight'
		})
	];

	const pattern = new Pattern(
		{
			contextId: PATTERN_CONTEXT_ID,
			description: 'for Design Drafts',
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
