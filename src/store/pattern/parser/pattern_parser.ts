import { Pattern } from '../pattern';

export abstract class PatternParser {
	public abstract parse(pattern: Pattern): boolean;
}
