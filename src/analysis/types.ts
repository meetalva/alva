import * as Fs from 'fs';

export interface Analysis {
	// tslint:disable-next-line:no-any
	attach(path: string, data: AnalysisLabel<any, any>): Promise<void>;
	// tslint:disable-next-line:no-any
	get(path: string): Promise<any>;
}

export interface AnalysisContext {
	fileMappers: AnalysisMapper[];
	fs: typeof Fs;
	ignore?: string[];
	projectMappers: AnalysisMapper[];
}

export interface AnalysisMapperContext {
	analysis: Analysis;
	fs: typeof Fs;
}

export type AnalysisMapper = (path: string, context: AnalysisMapperContext) => Promise<void>;

export interface AnalysisLabel<T, V> {
	payload: V;
	type: T;
}
