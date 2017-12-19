import { PatternFolder } from './folder';
import { Pattern } from './pattern';
import { Property } from './property/property';
import { StringProperty } from './property/string_property';

export class TextPattern extends Pattern {
	public constructor(folder: PatternFolder) {
		super(folder, 'text', 'Text');

		const property: Property = new StringProperty('text');
		property.setName('Text');
		this.addProperty(property);
	}

	public reload(): void {
		// Do nothing, this is a synthetic pattern
	}
}
