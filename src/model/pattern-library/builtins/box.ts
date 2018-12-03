import { Pattern, PatternSlot } from '../../pattern';
import { BuiltInContext, BuiltInResult } from '../pattern-library';
import {
	PatternBooleanProperty,
	PatternEnumProperty,
	PatternEnumPropertyOption,
	PatternNumberProperty,
	PatternStringProperty
} from '../../pattern-property';
import * as Types from '../../../types';
import { IconName } from '../../../components';

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
	const backgroundColorId = context.options.getGlobalPropertyId(
		patternId,
		BACKGROUND_COLOR_CONTEXT_ID
	);

	const defaultAlign = context.options.getGlobalEnumOptionId(alignId, 'center');
	const defaultDirection = context.options.getGlobalEnumOptionId(flexDirectionId, 'row');
	const defaultJustify = context.options.getGlobalEnumOptionId(justifyId, 'center');

	const properties = [
		new PatternBooleanProperty({
			contextId: FLEX_CONTEXT_ID,
			id: flexId,
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Flex',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'flex',
			defaultValue: true
		}),
		new PatternEnumProperty({
			contextId: FLEX_DIRECTION_CONTEXT_ID,
			id: flexDirectionId,
			inputType: Types.PatternPropertyInputType.RadioGroup,
			label: 'Direction',
			propertyName: 'flexDirection',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			defaultOptionId: defaultDirection,
			required: false,
			hidden: false,
			options: [
				new PatternEnumPropertyOption({
					contextId: 'row',
					id: context.options.getGlobalEnumOptionId(flexDirectionId, 'row'),
					name: 'Horizontal',
					value: 'row',
					icon: undefined,
					ordinal: '0'
				}),
				new PatternEnumPropertyOption({
					contextId: 'column',
					id: context.options.getGlobalEnumOptionId(flexDirectionId, 'column'),
					name: 'Vertical',
					value: 'column',
					icon: undefined,
					ordinal: '1'
				})
			]
		}),
		new PatternEnumProperty({
			contextId: ALIGN_ITEMS_CONTEXT_ID,
			id: alignId,
			inputType: Types.PatternPropertyInputType.RadioGroup,
			label: 'Align',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'alignItems',
			defaultOptionId: defaultAlign,
			required: false,
			hidden: false,
			options: [
				new PatternEnumPropertyOption({
					contextId: 'flex-start',
					id: context.options.getGlobalEnumOptionId(alignId, 'flex-start'),
					name: 'Start',
					value: 'flex-start',
					icon: IconName.FlexStart,
					ordinal: '0'
				}),
				new PatternEnumPropertyOption({
					contextId: 'center',
					id: defaultAlign,
					name: 'Center',
					value: 'center',
					icon: IconName.FlexCenter,
					ordinal: '1'
				}),
				new PatternEnumPropertyOption({
					contextId: 'flex-end',
					id: context.options.getGlobalEnumOptionId(alignId, 'flex-end'),
					name: 'End',
					value: 'flex-end',
					icon: IconName.FlexEnd,
					ordinal: '2'
				}),
				new PatternEnumPropertyOption({
					contextId: 'stretch',
					id: context.options.getGlobalEnumOptionId(alignId, 'stretch'),
					name: 'Stretch',
					value: 'stretch',
					icon: IconName.FlexStretch,
					ordinal: '3'
				}),
				new PatternEnumPropertyOption({
					contextId: 'baseline',
					id: context.options.getGlobalEnumOptionId(alignId, 'baseline'),
					name: 'Baseline',
					value: 'baseline',
					icon: IconName.FlexBaseline,
					ordinal: '4'
				})
			]
		}),
		new PatternEnumProperty({
			contextId: JUSTIFY_CONTENT_CONTEXT_ID,
			id: justifyId,
			inputType: Types.PatternPropertyInputType.Select,
			label: 'Justify',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'justifyContent',
			defaultOptionId: defaultJustify,
			hidden: false,
			required: false,
			options: [
				new PatternEnumPropertyOption({
					contextId: 'flex-start',
					id: context.options.getGlobalEnumOptionId(justifyId, 'flex-start'),
					name: 'Start',
					value: 'flex-start',
					icon: undefined,
					ordinal: '0'
				}),
				new PatternEnumPropertyOption({
					contextId: 'flex-end',
					id: context.options.getGlobalEnumOptionId(justifyId, 'flex-end'),
					name: 'End',
					value: 'flex-end',
					icon: undefined,
					ordinal: '1'
				}),
				new PatternEnumPropertyOption({
					contextId: 'center',
					id: defaultJustify,
					name: 'Center',
					value: 'center',
					icon: undefined,
					ordinal: '2'
				}),
				new PatternEnumPropertyOption({
					contextId: 'space-between',
					id: context.options.getGlobalEnumOptionId(justifyId, 'space-between'),
					name: 'Space Between',
					value: 'space-between',
					icon: undefined,
					ordinal: '3'
				}),
				new PatternEnumPropertyOption({
					contextId: 'space-around',
					id: context.options.getGlobalEnumOptionId(justifyId, 'space-around'),
					name: 'Space Around',
					value: 'space-around',
					icon: undefined,
					ordinal: '4'
				}),
				new PatternEnumPropertyOption({
					contextId: 'space-evenly',
					id: context.options.getGlobalEnumOptionId(justifyId, 'space-evenly'),
					name: 'Space Evenly',
					value: 'space-evenly',
					icon: undefined,
					ordinal: '5'
				})
			]
		}),
		new PatternBooleanProperty({
			contextId: FLEX_WRAP_CONTEXT_ID,
			id: flexWrapId,
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Wrap',
			propertyName: 'wrap',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			defaultValue: false
		}),
		new PatternNumberProperty({
			contextId: FLEX_GROW_CONTEXT_ID,
			id: growId,
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Grow',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'flexGrow',
			defaultValue: 0
		}),
		new PatternNumberProperty({
			contextId: FLEX_SHRINK_CONTEXT_ID,
			id: shrinkId,
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Shrink',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'flexShrink',
			defaultValue: 1
		}),
		new PatternStringProperty({
			contextId: FLEX_BASIS_CONTEXT_ID,
			id: basisId,
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Size',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'flexBasis',
			defaultValue: 'auto'
		}),
		new PatternStringProperty({
			contextId: WIDHT_CONTEXT_ID,
			id: widthId,
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Width',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'width',
			defaultValue: 'auto'
		}),
		new PatternStringProperty({
			contextId: HEIGHT_CONTEXT_ID,
			id: heightId,
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Height',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'height',
			defaultValue: 'auto'
		}),
		new PatternStringProperty({
			contextId: BACKGROUND_COLOR_CONTEXT_ID,
			id: backgroundColorId,
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Background Color',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'backgroundColor'
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
				contextId: CONTEXT_ID,
				description: 'for Flexbox Layouts',
				exportName: 'default',
				icon: 'Box',
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
