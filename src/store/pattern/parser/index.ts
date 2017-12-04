import { Pattern } from '..';

export abstract class PatternParser {
	public constructor() {
		//
	}

	public abstract parse(pattern: Pattern): boolean;
}
