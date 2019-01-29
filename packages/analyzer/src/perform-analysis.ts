import * as Analyzer from '.';
import * as T from '@meetalva/types';
import * as uuid from 'uuid';

export interface AssignmentProvider {
	assignEnumOptionId(enumId: string, id: string): string;
	assignPatternId(id: string): string;
	assignPropertyId(patternId: string, id: string): string;
	assignSlotId(patternId: string, id: string): string;
}

export async function performAnalysis<T extends AssignmentProvider>(
	path: string,
	{ previousLibrary }: { previousLibrary: T | undefined }
): Promise<T.LibraryAnalysisResult> {
	const getGobalEnumOptionId = previousLibrary
		? previousLibrary.assignEnumOptionId.bind(previousLibrary)
		: () => uuid.v4();

	const getGlobalPatternId = previousLibrary
		? previousLibrary.assignPatternId.bind(previousLibrary)
		: () => uuid.v4();

	const getGlobalPropertyId = previousLibrary
		? previousLibrary.assignPropertyId.bind(previousLibrary)
		: () => uuid.v4();

	const getGlobalSlotId = previousLibrary
		? previousLibrary.assignSlotId.bind(previousLibrary)
		: () => uuid.v4();

	return Analyzer.analyze(path, {
		getGobalEnumOptionId,
		getGlobalPatternId,
		getGlobalPropertyId,
		getGlobalSlotId,
		analyzeBuiltins: true
	});
}
