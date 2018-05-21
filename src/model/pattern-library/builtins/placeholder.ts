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
			contextId: 'synthetic:placeholder',
			exportName: 'default',
			name: 'Placeholder',
			propertyIds: placeholderProperties.map(p => p.getId()),
			slots: [],
			type: SyntheticPatternType.SyntheticPlaceholder
		},
		context
	);

	return {
		placeholderPattern,
		placeholderProperties
	};
};
