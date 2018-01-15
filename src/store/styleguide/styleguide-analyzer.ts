import { Pattern } from '../pattern/pattern';
import { PatternType } from '../pattern/pattern-type';

export abstract class StyleguideAnalyzer<T extends Pattern = Pattern> {
	private readonly id: string;

	public constructor(id: string) {
		this.id = id;
	}

	public getId(): string {
		return this.id;
	}

	public abstract getPatternType(): PatternType;

	public abstract analyze(path: string): T[];
}
