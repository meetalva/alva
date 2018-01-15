import { getReactComponentExports, ReactComponentExport } from './typescript/react';
import { PatternFileInfo, ReactPattern } from './react-pattern';
import { StyleguideAnalyzer } from '../styleguide-analyzer';
import * as ts from 'typescript';

import * as FileUtils from 'fs';
import * as PathUtils from 'path';
import { PatternType } from '../../pattern/pattern-type';

export class TypescriptReactAnalyzer extends StyleguideAnalyzer<ReactPattern> {
	protected program: ts.Program;

	public getPatternType(): PatternType {
		return PatternType.react;
	}

	public analyze(path: string): ReactPattern[] {
		const patterns: ReactPattern[] = [];

		const fileInfos = walkDirectoriesAndCollectPatterns(path);

		const declarationFiles = fileInfos.map(patternInfo => patternInfo.declarationFilePath);

		this.program = ts.createProgram(declarationFiles, {}, undefined, this.program);

		fileInfos.forEach(fileInfo => {
			const sourceFile = this.program.getSourceFile(fileInfo.declarationFilePath);
			const exports = getReactComponentExports(sourceFile, this.program);

			exports.forEach(exportInfo => {
				const id = generatePatternId(path, fileInfo, exportInfo);
				const name = getPatternName(fileInfo, exportInfo);

				const pattern = new ReactPattern({
					id,
					name,
					analyzer: this,
					fileInfo,
					exportInfo
				});

				patterns.push(pattern);
			});
		});

		return patterns;
	}
}

function getPatternName(fileInfo: PatternFileInfo, exportInfo: ReactComponentExport): string {
	const baseName = PathUtils.basename(fileInfo.jsFilePath, '.js');
	const directoryName = PathUtils.basename(fileInfo.directory);
	const name = exportInfo.name || baseName !== 'index' ? baseName : directoryName;

	return name;
}

function walkDirectoriesAndCollectPatterns(directory: string): PatternFileInfo[] {
	let patterns = detectPatternsInDirectory(directory);

	FileUtils.readdirSync(directory).forEach(childName => {
		const childPath = PathUtils.join(directory, childName);

		if (FileUtils.lstatSync(childPath).isDirectory()) {
			patterns = patterns.concat(walkDirectoriesAndCollectPatterns(childPath));
		}
	});

	return patterns;
}

function detectPatternsInDirectory(directory: string): PatternFileInfo[] {
	const patterns: PatternFileInfo[] = [];

	FileUtils.readdirSync(directory).forEach(childName => {
		const childPath = PathUtils.join(directory, childName);

		if (!childPath.endsWith('.d.ts')) {
			return;
		}

		const declarationFilePath = childPath;
		const name = PathUtils.basename(declarationFilePath, '.d.ts');
		const jsFilePath = PathUtils.join(directory, `${name}.js`);

		if (FileUtils.existsSync(jsFilePath)) {
			const patternFileInfo: PatternFileInfo = {
				directory,
				declarationFilePath,
				jsFilePath
			};

			patterns.push(patternFileInfo);
		}
	});

	return patterns;
}

function generatePatternId(
	basePath: string,
	fileInfo: PatternFileInfo,
	exportInfo: ReactComponentExport
): string {
	const baseName = PathUtils.basename(fileInfo.jsFilePath, '.js');
	const relativeDirectoryPath = PathUtils.relative(basePath, fileInfo.directory);

	const baseIdentifier = PathUtils.join(relativeDirectoryPath, baseName);
	const exportIdentifier = exportInfo.name ? `@${exportInfo.name}` : '';

	const id = `${baseIdentifier}${exportIdentifier}`;

	return id;
}
