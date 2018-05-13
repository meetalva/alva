import { Pattern, SyntheticPatternType } from '../../pattern';
import * as PatternProperty from '../../pattern-property';

export const Text = () =>
	new Pattern({
		name: 'Text',
		path: '',
		type: SyntheticPatternType.SyntheticText,
		properties: [
			new PatternProperty.PatternStringProperty({
				label: 'Text',
				propertyName: 'text'
			})
		]
	});
