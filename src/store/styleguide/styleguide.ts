import { Folder } from './utils/folder';
import { Pattern } from '../pattern/pattern';
import { StyleguideAnalyzer } from './styleguide-analyzer';

export class Styleguide {
	private readonly analyzers: StyleguideAnalyzer[];
	private readonly path: string;
	private patterns: Map<string, Pattern> = new Map();
	private folders: Folder<Pattern>[] = [];

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

	public getFolders(): Folder<Pattern>[] {
		return this.folders;
	}

	public load(): void {
		this.patterns = new Map();
		this.folders = [];

		this.analyzers.forEach(analyzer => {
			const groupedPatterns = analyzer.analyze(this.path);
			const patterns = groupedPatterns.flatten();

			this.folders.push(groupedPatterns);

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
}

function getStyleguideLocalPatternId(analyzerId: string, patternId: string): string {
	return `${analyzerId}:${patternId}`;
}
