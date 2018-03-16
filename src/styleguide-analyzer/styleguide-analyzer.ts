import { HighlightElementFunction } from '../component/preview';
import { Store } from '../store/store';
import { Styleguide } from '../store/styleguide/styleguide';

/**
 * A styleguide analyzer walks through the pattern implementations of a styleguide.
 * It finds folders and patterns, including multiple files within a folder, and multiple exports within a file.
 * It then creates pattern folder and pattern instances representing the implementations, and puts them into the styleguide registry.
 * @see README.md for more details on analyzers and how to write your own.
 */
export abstract class StyleguideAnalyzer {
	/**
	 * Analyzes the pattern implementation directories starting the configured root path, and puts all pattern folders and patterns into the styleguide registry.
	 * Note: Implementations should call the styleguide's addPattern method, and optionally create new pattern folders based on the styleguide's patternRoot, and also add the pattern to these folders (also addPattern).
	 * @param styleguide The styleguide to analyze its implementations.
	 */
	public abstract analyze(styleguide: Styleguide): void;

	/**
	 * Renders the preview application based on the store.
	 * @param store The store that the render should be based on.
	 * @param highlightElement The function that should be called inside the renderer when a element need to be highlighted.
	 */
	public abstract render(store: Store, highlightElement: HighlightElementFunction): void;
}
