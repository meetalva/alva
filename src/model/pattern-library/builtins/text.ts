import { Pattern, SyntheticPatternType } from '../../pattern';
import * as PatternProperty from '../../pattern-property';

export const Text = context => {
	const textProperties = [
		new PatternProperty.PatternStringProperty({
			label: 'Text',
			propertyName: 'text'
		})
	];

	return {
		textProperties,
		textPattern: new Pattern(
			{
				name: 'Text',
				path: '',
				type: SyntheticPatternType.SyntheticText,
				propertyIds: textProperties.map(p => p.getId())
			},
			context
		)
	};
};
