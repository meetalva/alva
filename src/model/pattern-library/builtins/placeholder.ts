import { Pattern, SyntheticPatternType } from '../../pattern';
import * as PatternProperty from '../../pattern-property';

export const Placeholder = context => {
	const placeholderProperties = [
		new PatternProperty.PatternAssetProperty({
			label: 'Source',
			propertyName: 'src'
		})
	];

	const placeholderPattern = new Pattern(
		{
			name: 'Placeholder',
			path: '',
			type: SyntheticPatternType.SyntheticPlaceholder,
			propertyIds: placeholderProperties.map(p => p.getId())
		},
		context
	);

	return {
		placeholderPattern,
		placeholderProperties
	};
};
