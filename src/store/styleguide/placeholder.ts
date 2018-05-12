import { Pattern, SyntheticPatternType } from '../pattern';
import * as PatternProperty from '../pattern-property';

export const Placeholder = () =>
	new Pattern({
		name: 'Placeholder',
		path: '',
		type: SyntheticPatternType.SyntheticPlaceholder,
		properties: [
			new PatternProperty.PatternAssetProperty({
				label: 'Source',
				propertyName: 'src'
			})
		]
	});
