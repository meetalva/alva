import { Pattern } from '../pattern';

/**
 * Pattern parsers are responsible for analyzing the build and source files folders of a
 * styleguide pattern, to read the meta-information like ID, name, properties, etc.
 * Implementations may focus on certain languages, file types, meta-information etc,
 * as all parsers contribute to the patterns' information.
 * Some parsers may read source code like TypeScript, while others read JSON files, for instance.
 * @see TypeScriptParser
 */
export abstract class PatternParser {
	/**
	 * Reads all aspects of pattern meta-information supported by this parser.
	 * The result is updated directly into the pattern object provided.
	 * @param pattern The pattern to enrich with meta-information.
	 * @return Whether the pattern is valid from this parser's point of view.
	 * If any pattern parser returns true, the pattern will be available in Alva.
	 */
	public abstract parse(pattern: Pattern): boolean;
}
