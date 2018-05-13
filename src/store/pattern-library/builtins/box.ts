import { Pattern, SyntheticPatternType } from '../../pattern';
import {
	PatternBooleanProperty,
	PatternEnumProperty,
	PatternEnumPropertyOption,
	PatternNumberProperty,
	PatternStringProperty
} from '../../pattern-property';
import * as uuid from 'uuid';

export const Box = context => {
	const defaultAlign = uuid.v4();
	const defaultJustify = uuid.v4();

	const boxProperties = [
		new PatternBooleanProperty({
			label: 'Flex',
			propertyName: 'flex',
			defaultValue: true
		}),
		new PatternNumberProperty({
			label: 'Grow',
			propertyName: 'flexGrow',
			defaultValue: 1
		}),
		new PatternNumberProperty({
			label: 'Shrink',
			propertyName: 'flexShrink',
			defaultValue: 1
		}),
		new PatternStringProperty({
			label: 'Size',
			propertyName: 'flexBasis',
			defaultValue: 'auto'
		}),
		new PatternStringProperty({
			label: 'Width',
			propertyName: 'width',
			defaultValue: 'auto'
		}),
		new PatternStringProperty({
			label: 'Height',
			propertyName: 'height',
			defaultValue: 'auto'
		}),
		new PatternEnumProperty({
			label: 'Align',
			propertyName: 'alignItems',
			defaultValue: defaultAlign,
			options: [
				new PatternEnumPropertyOption({
					id: uuid.v4(),
					name: 'Start',
					value: 'flex-start',
					ordinal: 0
				}),
				new PatternEnumPropertyOption({
					id: uuid.v4(),
					name: 'End',
					value: 'flex-end',
					ordinal: 1
				}),
				new PatternEnumPropertyOption({
					id: defaultAlign,
					name: 'Center',
					value: 'center',
					ordinal: 2
				}),
				new PatternEnumPropertyOption({
					id: uuid.v4(),
					name: 'Stretch',
					value: 'stretch',
					ordinal: 3
				}),
				new PatternEnumPropertyOption({
					id: uuid.v4(),
					name: 'Baseline',
					value: 'baseline',
					ordinal: 4
				})
			]
		}),
		new PatternEnumProperty({
			label: 'Justify',
			propertyName: 'justifyContent',
			defaultValue: defaultJustify,
			options: [
				new PatternEnumPropertyOption({
					id: uuid.v4(),
					name: 'Start',
					value: 'flex-start',
					ordinal: 0
				}),
				new PatternEnumPropertyOption({
					id: uuid.v4(),
					name: 'End',
					value: 'flex-end',
					ordinal: 1
				}),
				new PatternEnumPropertyOption({
					id: defaultJustify,
					name: 'Center',
					value: 'center',
					ordinal: 2
				}),
				new PatternEnumPropertyOption({
					id: uuid.v4(),
					name: 'Space Between',
					value: 'space-between',
					ordinal: 3
				}),
				new PatternEnumPropertyOption({
					id: uuid.v4(),
					name: 'Space Around',
					value: 'space-around',
					ordinal: 4
				}),
				new PatternEnumPropertyOption({
					id: uuid.v4(),
					name: 'Space Evenly',
					value: 'space-evenly',
					ordinal: 5
				})
			]
		}),
		new PatternBooleanProperty({
			label: 'Column',
			propertyName: 'column',
			defaultValue: false
		}),
		new PatternBooleanProperty({
			label: 'Wrap',
			propertyName: 'wrap',
			defaultValue: false
		}),
		new PatternNumberProperty({
			label: 'Order',
			propertyName: 'order'
		}),
		new PatternStringProperty({
			label: 'Background Color',
			propertyName: 'backgroundColor'
		})
	];

	return {
		boxPattern: new Pattern(
			{
				name: 'Box',
				path: '',
				type: SyntheticPatternType.SyntheticBox,
				propertyIds: boxProperties.map(p => p.getId())
			},
			context
		),
		boxProperties
	};
};
