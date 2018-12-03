import { Pattern, PatternSlot } from '../../pattern';
import { BuiltInContext, BuiltInResult } from '../pattern-library';
import * as Types from '../../../types';

const PATTERN_CONTEXT_ID = 'synthetic:page';
const SLOT_CONTEXT_ID = 'children';

export const Page = (context: BuiltInContext): BuiltInResult => {
	const patternId = context.options.getGlobalPatternId(PATTERN_CONTEXT_ID);
	const properties = [];

	const pattern = new Pattern(
		{
			contextId: PATTERN_CONTEXT_ID,
			description: '',
			exportName: 'default',
			icon: '',
			id: patternId,
			name: 'Page',
			origin: Types.PatternOrigin.BuiltIn,
			propertyIds: [],
			slots: [
				new PatternSlot({
					contextId: 'children',
					displayName: 'Children',
					description: '',
					example: '',
					hidden: false,
					propertyName: 'children',
					id: context.options.getGlobalSlotId(patternId, SLOT_CONTEXT_ID),
					required: false,
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
