import { Property } from '.';
import { Pattern } from '..';

export class PatternProperty extends Property {
	private pattern: Pattern;

	public constructor(id: string, name: string, required: boolean, pattern: Pattern) {
		super(id);
		this.pattern = pattern;
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		// Page element coerce their properties themselves
		return value;
	}

	public getPattern(): Pattern {
		return this.pattern;
	}

	public getType(): string {
		return 'pattern';
	}

	public toString(): string {
		return `PatternProperty(${super.toString()})`;
	}
}
