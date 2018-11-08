import { Pattern, PatternSlot } from '../../pattern';
import { BuiltInContext, BuiltInResult } from '../pattern-library';
import * as PatternProperty from '../../pattern-property';
import * as Types from '../../../types';

const PATTERN_CONTEXT_ID = 'synthetic:conditional';
const CONDITION_CONTEXT_ID = 'condition';
const TRUTHY_SLOT_CONTEXT_ID = 'truthy';
const FALSY_SLOT_CONTEXT_ID = 'falsy';

export const Conditional = (context: BuiltInContext): BuiltInResult => {
	const patternId = context.options.getGlobalPatternId(PATTERN_CONTEXT_ID);

	const properties = [
		new PatternProperty.PatternBooleanProperty({
			contextId: CONDITION_CONTEXT_ID,
			description: 'Show the "True" slot, disable to show the "False" slot',
			defaultValue: true,
			hidden: false,
			id: context.options.getGlobalPropertyId(patternId, CONDITION_CONTEXT_ID),
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Condition',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'condition',
			required: true
		})
	];

	const slots = [
		new PatternSlot({
			contextId: TRUTHY_SLOT_CONTEXT_ID,
			displayName: 'If True',
			description: '',
			example: '',
			hidden: false,
			propertyName: 'ifTrue',
			id: context.options.getGlobalSlotId(patternId, TRUTHY_SLOT_CONTEXT_ID),
			required: false,
			type: Types.SlotType.Property
		}),
		new PatternSlot({
			contextId: FALSY_SLOT_CONTEXT_ID,
			displayName: 'If False',
			description: '',
			example: '',
			hidden: false,
			propertyName: 'ifFalse',
			id: context.options.getGlobalSlotId(patternId, FALSY_SLOT_CONTEXT_ID),
			required: false,
			type: Types.SlotType.Property
		})
	];

	return {
		pattern: new Pattern(
			{
				contextId: PATTERN_CONTEXT_ID,
				description: 'for Show and Hide Logic',
				exportName: 'default',
				id: patternId,
				name: 'Conditional',
				origin: Types.PatternOrigin.BuiltIn,
				propertyIds: properties.map(p => p.getId()),
				slots,
				type: Types.PatternType.SyntheticConditional
			},
			context
		),
		properties
	};
};
