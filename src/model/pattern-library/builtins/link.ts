import { Pattern, PatternSlot } from '../../pattern';
import { BuiltInContext, BuiltInResult } from '../pattern-library';
import * as PatternProperty from '../../pattern-property';
import * as Types from '../../../types';

const PATTERN_CONTEXT_ID = 'synthetic:link';
const SLOT_CONTEXT_ID = 'children';
const HREF_CONTEXT_ID = 'href';

export const Link = (context: BuiltInContext): BuiltInResult => {
	const patternId = context.options.getGlobalPatternId(PATTERN_CONTEXT_ID);

	const properties = [
		new PatternProperty.PatternHrefProperty({
			contextId: HREF_CONTEXT_ID,
			example: 'https://meetalva.io',
			id: context.options.getGlobalPropertyId(patternId, HREF_CONTEXT_ID),
			label: 'Link target',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'href'
		})
	];

	const slots = [
		new PatternSlot({
			contextId: SLOT_CONTEXT_ID,
			displayName: 'Children',
			propertyName: 'children',
			id: context.options.getGlobalSlotId(patternId, SLOT_CONTEXT_ID),
			type: Types.SlotType.Children
		})
	];

	return {
		pattern: new Pattern(
			{
				contextId: PATTERN_CONTEXT_ID,
				description: 'for Interaction',
				exportName: 'default',
				id: patternId,
				name: 'Link',
				origin: Types.PatternOrigin.BuiltIn,
				propertyIds: properties.map(p => p.getId()),
				slots,
				type: Types.PatternType.SyntheticLink
			},
			context
		),
		properties
	};
};
