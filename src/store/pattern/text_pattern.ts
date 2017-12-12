import { PatternFolder } from './folder';
import { Property } from './property/index';
import { StringProperty } from './property/string_property';
import { Pattern } from '.';

export class TextPattern extends Pattern {
	public constructor(folder: PatternFolder) {
		super(folder, 'text');

		const property: Property = new StringProperty('text', 'Text', false);
		this.properties.set(property.getId(), property);
	}

	public reload(): void {
		// Do nothing, this is a synthetic pattern
	}
}
