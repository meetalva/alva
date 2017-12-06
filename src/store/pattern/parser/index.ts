import { Property } from '../property';
import { Pattern } from '..';

export abstract class PatternParser {
	public abstract parse(pattern: Pattern): Property[] | undefined;
}
