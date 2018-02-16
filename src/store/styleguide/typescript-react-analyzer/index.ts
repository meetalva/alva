import { Directory } from '../utils/directory';
import { getReactComponentExports, ReactComponentExport } from './typescript/react';
import { PatternFileInfo, ReactPattern } from './react-pattern';
import { StyleguideAnalyzer } from '../styleguide-analyzer';
import * as ts from 'typescript';

import { Folder } from '../utils/folder';
import * as FileUtils from 'fs';
import * as PathUtils from 'path';
import { PatternType } from '../../pattern/pattern-type';

export class TypescriptReactAnalyzer extends StyleguideAnalyzer<ReactPattern> {
	protected program: ts.Program;

	public getPatternType(): PatternType {
		return PatternType.react;
	}

	public analyze(path: string, program?: ts.Program, rootPath?: string): Folder<ReactPattern> {
		const directory = new Directory(path);
		const rootDirectory = rootPath ? new Directory(rootPath) : directory;
		const folder = new Folder<ReactPattern>(directory.getName());

		if (!program) {
			const fileInfoFolder = createFileInfoFolder(path);
			const declarationFiles = fileInfoFolder
				.flatten()
				.map(fileInfo => fileInfo.declarationFilePath);
			program = ts.createProgram(declarationFiles, {}, undefined, this.program);
		}

		const fileInfos = detectPatternsInDirectory(rootDirectory, directory);

		for (const fileInfo of fileInfos) {
			const sourceFile = program.getSourceFile(fileInfo.declarationFilePath);

			if (!sourceFile) {
				continue;
			}

			const exports = getReactComponentExports(sourceFile, program);

			exports.forEach(exportInfo => {
				const id = generatePatternId(rootDirectory.getPath(), fileInfo, exportInfo);
				const name = getPatternName(fileInfo, exportInfo);

				const pattern = new ReactPattern({
					id,
					name,
					analyzer: this,
					fileInfo,
					exportInfo
				});

				folder.getItems().push(pattern);
			});
		}

		for (const subDirectory of directory.getDirectories()) {
			if (subDirectory.getName().toLowerCase() === 'node_modules') {
				continue;
			}

			const patternSubFolder = this.analyze(
				subDirectory.getPath(),
				program,
				rootDirectory.getPath()
			);
			folder.getSubFolders().push(patternSubFolder);
		}

		return folder;
	}
}

function getPatternName(fileInfo: PatternFileInfo, exportInfo: ReactComponentExport): string {
	const baseName = PathUtils.basename(fileInfo.jsFilePath, '.js');
	const directoryName = PathUtils.basename(fileInfo.directory);
	const name = exportInfo.name || (baseName !== 'index' ? baseName : directoryName);

	return name;
}

function createFileInfoFolder(path: string, rootPath?: string): Folder<PatternFileInfo> {
	const directory = new Directory(path);
	const rootDirectory = rootPath ? new Directory(rootPath) : directory;

	const folder: Folder<PatternFileInfo> = new Folder<PatternFileInfo>(
		directory.getName(),
		directory.getPath()
	);

	const patternInfos = detectPatternsInDirectory(rootDirectory, directory);
	folder.setItems(patternInfos);

	for (const subDirectory of directory.getDirectories()) {
		if (subDirectory.getName().toLowerCase() === 'node_modules') {
			continue;
		}

		const subFolder = createFileInfoFolder(subDirectory.getPath(), rootDirectory.getPath());
		folder.getSubFolders().push(subFolder);
	}

	return folder;
}

function detectPatternsInDirectory(
	rootDirectory: Directory,
	directory: Directory
): PatternFileInfo[] {
	const patterns: PatternFileInfo[] = [];

	for (const filePath of directory.getFiles()) {
		if (!filePath.endsWith('.d.ts')) {
			continue;
		}

		const declarationFilePath = filePath;
		const name = PathUtils.basename(declarationFilePath, '.d.ts');
		const jsFilePath = PathUtils.join(directory.getPath(), `${name}.js`);

		let iconPath: string | undefined = PathUtils.join(directory.getPath(), 'icon.svg');
		iconPath = PathUtils.relative(rootDirectory.getPath(), iconPath);
		iconPath = iconPath
			.split('/')
			.slice(1)
			.join('/');
		iconPath = PathUtils.resolve(rootDirectory.getPath(), iconPath);
		iconPath = FileUtils.existsSync(iconPath) ? iconPath : undefined;

		if (FileUtils.existsSync(jsFilePath)) {
			const patternFileInfo: PatternFileInfo = {
				directory: directory.getPath(),
				declarationFilePath,
				jsFilePath,
				iconPath
			};

			patterns.push(patternFileInfo);
		}
	}

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
