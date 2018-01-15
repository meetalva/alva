import { Pattern } from '../pattern/pattern';
import { StyleguideAnalyzer } from './styleguide-analyzer';

export class Styleguide {
	private readonly analyzers: StyleguideAnalyzer[];
	private readonly path: string;

	private patterns: Map<string, Pattern> = new Map();

	public constructor(path: string, analyzers?: StyleguideAnalyzer[]) {
		this.analyzers = analyzers || [];
		this.path = path;
	}

	public getPath(): string {
		return this.path;
	}

	public getAnalyzers(): ReadonlyArray<StyleguideAnalyzer> {
		return this.analyzers;
	}

	public getPatterns(): ReadonlyMap<string, Pattern> {
		return this.patterns;
	}

	public load(): void {
		this.patterns = new Map();

		this.analyzers.forEach(analyzer => {
			const patterns = analyzer.analyze(this.path);

			patterns.forEach(pattern => {
				const localId = getStyleguideLocalPatternId(analyzer.getId(), pattern.getId());
				this.patterns.set(localId, pattern);
			});
		});
	}

	public findPattern(analyzerId: string, id: string): Pattern | undefined {
		const localId = getStyleguideLocalPatternId(analyzerId, id);
		return this.patterns.get(localId);
	}

	/**
	 * Returns all pattern of this folder and its sub-folders matching a given search string.
	 * @param term The search string as provided by the user.
	 * @return The list of matching patterns.
	 */
	public searchPatterns(term: string): Pattern[] {
		const result: Pattern[] = [];
		this.patterns.forEach(pattern => {
			if (patternMatchesSearch(pattern, term)) {
				result.push(pattern);
			}
		});

		return result;
	}
}

function patternMatchesSearch(pattern: Pattern, term: string): boolean {
	if (!term || !pattern.getName) {
		return false;
	}
	return (
		pattern
			.getName()
			.toLowerCase()
			.indexOf(term.toLowerCase()) >= 0
	);
}

function getStyleguideLocalPatternId(analyzerId: string, patternId: string): string {
	return `${analyzerId}:${patternId}`;
}
