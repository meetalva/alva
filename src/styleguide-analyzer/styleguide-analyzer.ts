import { Styleguide } from '../store/styleguide/styleguide';

export abstract class StyleguideAnalyzer {
	public abstract analyze(styleGuide: Styleguide): void;
	public abstract getPatternType(): string;
}
