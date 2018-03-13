import { BooleanProperty } from '../../store/styleguide/property/boolean-property';
import { Pattern } from '../../store/styleguide/pattern';
import { HighlightElementFunction } from '../../component/preview';
import { renderAngular } from '../../component/presentation/angular/render';
import { Store } from '../../store/store';
import { Styleguide } from '../../store/styleguide/styleguide';
import { StyleguideAnalyzer } from '../styleguide-analyzer';

export interface PatternInfo {
	declarationPath: string;
	directory: string;
	iconPath?: string;
	implementationPath: string;
}

/**
 * A styleguide analyzer for Angular patterns.
 */
export class Analyzer extends StyleguideAnalyzer {
	/**
	 * @inheritdoc
	 */
	public analyze(styleguide: Styleguide): void {
		const patternRoot = styleguide.getPatternRoot();
		const pattern = new Pattern(
			'patternid',
			'patternname',
			'path/to/the/file'
		);
		pattern.addProperty(new BooleanProperty('property id'));

		patternRoot.addPattern(pattern);
		styleguide.addPattern(pattern);
	}

	/**
	 * @inheritdoc
	 */
	public render(store: Store, highlightElement: HighlightElementFunction): void {
		renderAngular(store, highlightElement);
	}
}
