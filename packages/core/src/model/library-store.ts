import * as Mobx from 'mobx';
import { PatternLibrary } from './pattern-library';

enum PatternLibraryEntryState {
	Empty,
	Fetching,
	Fetched,
	Installing,
	Installed
}

export interface PatternLibraryEntry {
	patternLibrary: PatternLibrary | undefined;
	globalName: string;
	state: PatternLibraryEntryState;
}

export class LibraryStore {
	public recommended = ['@meetalva/designkit@<=2', 'material-ui@'];

	@Mobx.computed
	private get recommendedEntries(): PatternLibraryEntry[] {
		return this.recommended.map(globalName => ({
			patternLibrary: undefined,
			globalName,
			state: PatternLibraryEntryState.Empty
		}));
	}

	@Mobx.computed
	public get entries(): PatternLibraryEntry[] {
		return [...this.recommendedEntries];
	}
}
