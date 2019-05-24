import * as Essentials from '@meetalva/essentials';
import * as Types from '@meetalva/types';
import { PatternLibrary } from './pattern-library';

const data = Essentials.analysis as any;

export const builtinPatternLibrary = (() => {
	// Legacy analysis persistence - Types.SerializedPatternLibrary
	if (data.model === Types.ModelName.PatternLibrary) {
		const serializedLibrary = data as Types.SerializedPatternLibrary;
		return PatternLibrary.from(serializedLibrary);
	}

	// Current analysis persistence - Types.LibraryAnalysis
	const analysis = data as Types.LibraryAnalysis;

	return PatternLibrary.fromAnalysis(analysis, {
		analyzeBuiltins: true,
		installType: Types.PatternLibraryInstallType.Local
	});
})();
