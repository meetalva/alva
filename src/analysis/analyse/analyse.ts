import { Analysis } from './analysis';
import * as Fs from 'fs';
import * as Path from 'path';
import * as readdir from 'readdir-enhanced';
import * as T from '../types';

export interface AnalysisResult {
	analysis: Analysis;
}

export async function analyse(path: string, context: T.AnalysisContext): Promise<AnalysisResult> {
	const { fileMappers, projectMappers } = context;

	const analysis = Analysis.create();
	const mapperContext = { analysis, fs: context.fs };

	await Promise.all(projectMappers.map(p => p(path, mapperContext)));

	const files = await getFiles(path, { fs: context.fs });

	await Promise.all(files.map(file => Promise.all(fileMappers.map(f => f(file, mapperContext)))));

	return {
		analysis
	};
}

export interface FileReaderContext {
	fs: typeof Fs;
}

async function getFiles(path: string, context: FileReaderContext): Promise<string[]> {
	const files = await readdir(path, {
		deep: true,
		filter: stat => stat.isFile(),
		fs: {
			lstat: (context.fs.lstat || context.fs.stat).bind(context.fs),
			readdir: context.fs.readdir.bind(context.fs),
			stat: context.fs.stat.bind(context.fs)
		}
	});

	return files.map(file => Path.resolve(path, file));
}
