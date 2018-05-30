import { Pattern, PatternSlot } from '../../pattern';
import { BuiltInContext, BuiltInResult } from '../pattern-library';
import {
	PatternBooleanProperty,
	PatternEnumProperty,
	PatternEnumPropertyOption,
	PatternNumberProperty,
	PatternStringProperty
} from '../../pattern-property';
import * as Types from '../../types';

const CONTEXT_ID = 'synthetic:box';
const FLEX_CONTEXT_ID = 'flex';
const SLOT_CONTEXT_ID = 'children';
const FLEX_GROW_CONTEXT_ID = 'flex-grow';
const FLEX_SHRINK_CONTEXT_ID = 'flex-shrink';
const FLEX_BASIS_CONTEXT_ID = 'flex-basis';
const WIDHT_CONTEXT_ID = 'width';
const HEIGHT_CONTEXT_ID = 'height';
const ALIGN_ITEMS_CONTEXT_ID = 'align-items';
const JUSTIFY_CONTENT_CONTEXT_ID = 'justify-content';
const FLEX_DIRECTION_CONTEXT_ID = 'flex-direction';
const FLEX_WRAP_CONTEXT_ID = 'flex-wrap';
const ORDER_CONTEXT_ID = 'order';
const BACKGROUND_COLOR_CONTEXT_ID = 'background-color';

export const Box = (context: BuiltInContext): BuiltInResult => {
	const patternId = context.options.getGlobalPatternId(CONTEXT_ID);

	const flexId = context.options.getGlobalPropertyId(patternId, FLEX_CONTEXT_ID);
	const growId = context.options.getGlobalPropertyId(patternId, FLEX_GROW_CONTEXT_ID);
	const shrinkId = context.options.getGlobalPropertyId(patternId, FLEX_SHRINK_CONTEXT_ID);
	const basisId = context.options.getGlobalPropertyId(patternId, FLEX_BASIS_CONTEXT_ID);
	const widthId = context.options.getGlobalPropertyId(patternId, WIDHT_CONTEXT_ID);
	const heightId = context.options.getGlobalPropertyId(patternId, HEIGHT_CONTEXT_ID);
	const alignId = context.options.getGlobalPropertyId(patternId, ALIGN_ITEMS_CONTEXT_ID);
	const justifyId = context.options.getGlobalPropertyId(patternId, JUSTIFY_CONTENT_CONTEXT_ID);
	const flexDirectionId = context.options.getGlobalPropertyId(
		patternId,
		FLEX_DIRECTION_CONTEXT_ID
	);
	const flexWrapId = context.options.getGlobalPropertyId(patternId, FLEX_WRAP_CONTEXT_ID);
	const orderId = context.options.getGlobalPropertyId(patternId, ORDER_CONTEXT_ID);
	const backgroundColorId = context.options.getGlobalPropertyId(
		patternId,
		BACKGROUND_COLOR_CONTEXT_ID
	);

	const defaultAlign = context.options.getGloablEnumOptionId(alignId, 'center');
	const defaultJustify = context.options.getGloablEnumOptionId(justifyId, 'center');

	const properties = [
		new PatternBooleanProperty({
			contextId: FLEX_CONTEXT_ID,
			id: flexId,
			label: 'Flex',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'flex',
			defaultValue: true
		}),
		new PatternNumberProperty({
			contextId: FLEX_GROW_CONTEXT_ID,
			id: growId,
			label: 'Grow',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'flexGrow',
			defaultValue: 1
		}),
		new PatternNumberProperty({
			contextId: FLEX_SHRINK_CONTEXT_ID,
			id: shrinkId,
			label: 'Shrink',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'flexShrink',
			defaultValue: 1
		}),
		new PatternStringProperty({
			contextId: FLEX_BASIS_CONTEXT_ID,
			id: basisId,
			label: 'Size',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'flexBasis',
			defaultValue: 'auto'
		}),
		new PatternStringProperty({
			contextId: WIDHT_CONTEXT_ID,
			id: widthId,
			label: 'Width',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'width',
			defaultValue: 'auto'
		}),
		new PatternStringProperty({
			contextId: HEIGHT_CONTEXT_ID,
			id: heightId,
			label: 'Height',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'height',
			defaultValue: 'auto'
		}),
		new PatternEnumProperty({
			contextId: ALIGN_ITEMS_CONTEXT_ID,
			id: alignId,
			label: 'Align',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'alignItems',
			defaultOptionId: defaultAlign,
			required: false,
			hidden: false,
			options: [
				new PatternEnumPropertyOption({
					contextId: 'flex-start',
					id: context.options.getGloablEnumOptionId(alignId, 'flex-start'),
					name: 'Start',
					value: 'flex-start',
					ordinal: 0
				}),
				new PatternEnumPropertyOption({
					contextId: 'flex-end',
					id: context.options.getGloablEnumOptionId(alignId, 'flex-end'),
					name: 'End',
					value: 'flex-end',
					ordinal: 1
				}),
				new PatternEnumPropertyOption({
					contextId: 'center',
					id: defaultAlign,
					name: 'Center',
					value: 'center',
					ordinal: 2
				}),
				new PatternEnumPropertyOption({
					contextId: 'stretch',
					id: context.options.getGloablEnumOptionId(alignId, 'stretch'),
					name: 'Stretch',
					value: 'stretch',
					ordinal: 3
				}),
				new PatternEnumPropertyOption({
					contextId: 'baseline',
					id: context.options.getGloablEnumOptionId(alignId, 'baseline'),
					name: 'Baseline',
					value: 'baseline',
					ordinal: 4
				})
			]
		}),
		new PatternEnumProperty({
			contextId: JUSTIFY_CONTENT_CONTEXT_ID,
			id: justifyId,
			label: 'Justify',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'justifyContent',
			defaultOptionId: defaultJustify,
			hidden: false,
			required: false,
			options: [
				new PatternEnumPropertyOption({
					contextId: 'flex-start',
					id: context.options.getGloablEnumOptionId(justifyId, 'flex-start'),
					name: 'Start',
					value: 'flex-start',
					ordinal: 0
				}),
				new PatternEnumPropertyOption({
					contextId: 'flex-end',
					id: context.options.getGloablEnumOptionId(justifyId, 'flex-end'),
					name: 'End',
					value: 'flex-end',
					ordinal: 1
				}),
				new PatternEnumPropertyOption({
					contextId: 'center',
					id: defaultJustify,
					name: 'Center',
					value: 'center',
					ordinal: 2
				}),
				new PatternEnumPropertyOption({
					contextId: 'space-between',
					id: context.options.getGloablEnumOptionId(justifyId, 'space-between'),
					name: 'Space Between',
					value: 'space-between',
					ordinal: 3
				}),
				new PatternEnumPropertyOption({
					contextId: 'space-around',
					id: context.options.getGloablEnumOptionId(justifyId, 'space-around'),
					name: 'Space Around',
					value: 'space-around',
					ordinal: 4
				}),
				new PatternEnumPropertyOption({
					contextId: 'space-evenly',
					id: context.options.getGloablEnumOptionId(justifyId, 'space-evenly'),
					name: 'Space Evenly',
					value: 'space-evenly',
					ordinal: 5
				})
			]
		}),
		new PatternBooleanProperty({
			contextId: FLEX_DIRECTION_CONTEXT_ID,
			id: flexDirectionId,
			label: 'Column',
			propertyName: 'column',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			defaultValue: false
		}),
		new PatternBooleanProperty({
			contextId: FLEX_WRAP_CONTEXT_ID,
			id: flexWrapId,
			label: 'Wrap',
			propertyName: 'wrap',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			defaultValue: false
		}),
		new PatternNumberProperty({
			contextId: ORDER_CONTEXT_ID,
			id: orderId,
			label: 'Order',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'order'
		}),
		new PatternStringProperty({
			contextId: BACKGROUND_COLOR_CONTEXT_ID,
			id: backgroundColorId,
			label: 'Background Color',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'backgroundColor'
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
				contextId: CONTEXT_ID,
				exportName: 'default',
				id: patternId,
				name: 'Box',
				origin: Types.PatternOrigin.BuiltIn,
				propertyIds: properties.map(p => p.getId()),
				slots,
				type: Types.PatternType.SyntheticBox
			},
			context
		),
		properties
	};
};
