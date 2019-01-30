import * as Analyzer from '.';
import * as Types from '@meetalva/types';

export async function performAnalysis<T extends Types.ContextIdMap>(
	path: string,
	opts?: { ids?: T }
): Promise<Types.LibraryAnalysisResult> {
	const ids = opts ? opts.ids : undefined;
	return Analyzer.analyze(path, { ids, analyzeBuiltins: false });
}
