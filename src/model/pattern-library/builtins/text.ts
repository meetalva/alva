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
				contextId: 'synthetic:text',
				exportName: 'default',
				name: 'Text',
				propertyIds: textProperties.map(p => p.getId()),
				slots: [],
				type: SyntheticPatternType.SyntheticText
			},
			context
		)
	};
};
