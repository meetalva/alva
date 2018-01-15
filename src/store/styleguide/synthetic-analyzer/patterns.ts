import { Pattern, PatternInit } from '../../pattern/pattern';
import { StringProperty } from '../../pattern/property/string-property';

export function createTextPattern(init: PatternInit): Pattern {
	const pattern = new Pattern(init);

	const textProperty = new StringProperty('text');
	pattern.getProperties().set(textProperty.getId(), textProperty);

	return pattern;
}
