import { Pattern, PatternSlot } from '../../pattern';
import { BuiltInContext, BuiltInResult } from '../pattern-library';
import * as PatternProperty from '../../pattern-property';
import * as Types from '../../../types';

const PATTERN_CONTEXT_ID = 'synthetic:link';
const SLOT_CONTEXT_ID = 'children';
const ONCLICK_CONTEXT_ID = 'onClick';

export const Link = (context: BuiltInContext): BuiltInResult => {
	const patternId = context.options.getGlobalPatternId(PATTERN_CONTEXT_ID);

	const properties = [
		new PatternProperty.PatternEventHandlerProperty({
			contextId: ONCLICK_CONTEXT_ID,
			description: 'You can set an interaction that happens on Click.',
			event: new PatternProperty.PatternEvent({
				type: Types.PatternEventType.MouseEvent
			}),
			hidden: false,
			id: context.options.getGlobalPropertyId(patternId, ONCLICK_CONTEXT_ID),
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Interaction',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'onClick',
			required: false
		})
	];

	const slots = [
		new PatternSlot({
			contextId: SLOT_CONTEXT_ID,
			displayName: 'Children',
			description: '',
			example: '',
			hidden: false,
			propertyName: 'children',
			id: context.options.getGlobalSlotId(patternId, SLOT_CONTEXT_ID),
			required: false,
			type: Types.SlotType.Children
		})
	];

	return {
		pattern: new Pattern(
			{
				contextId: PATTERN_CONTEXT_ID,
				description: 'for Interaction',
				exportName: 'default',
				icon: 'ExternalLink',
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
