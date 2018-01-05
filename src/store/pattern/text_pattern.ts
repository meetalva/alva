import { PatternFolder } from './folder';
import { Pattern } from './pattern';
import { Property } from './property/property';
import { StringProperty } from './property/string_property';

/**
 * A pseudo-pattern representing text-node content of another pattern's children property.
 * The text pattern is not parsed by pattern parsers, but automatically generated.
 * It always contains one string property named "text".
 */
export class TextPattern extends Pattern {
	/**
	 * Creates a new pattern.
	 * @param folder The parent folder containing the pattern folder.
	 */
	public constructor(folder: PatternFolder) {
		super(folder, 'text', 'Text');

		const property: Property = new StringProperty('text');
		property.setName('Text');
		this.addProperty(property);
	}

	/**
	 * @inheritdoc
	 */
	public reload(): void {
		// Do nothing, this is a synthetic pattern
	}
}
