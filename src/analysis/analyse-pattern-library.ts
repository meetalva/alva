import { analyse } from './analyse';
import * as Fs from 'fs';
import * as mapFile from './map-file';

export interface PatternLibraryAnalysis {
	path: string;
}

export async function analysePatternLibrary(path: string): Promise<PatternLibraryAnalysis> {
	await analyse(path, {
		fileMappers: [mapFile.mapReactDocgen, mapFile.mapReactDocgenTypeScript],
		fs: Fs,
		ignore: ['node_modules/**/*', '.git/**/*'],
		projectMappers: []
	});

	return {
		path
	};
}
