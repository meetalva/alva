import { Directory } from '../directory';
import { PatternFolder } from '../../store/styleguide/folder';
import * as FileUtils from 'fs';
import * as PathUtils from 'path';
import { Pattern } from '../../store/styleguide/pattern';
import { Property } from '../../store/styleguide/property/property';
import { PropertyAnalyzer } from './property-analyzer';
import { Styleguide } from '../../store/styleguide/styleguide';
import { StyleguideAnalyzer } from '../styleguide-analyzer';
import { Type } from '../typescript/type';
import * as ts from 'typescript';
import { Export, TypescriptUtils } from '../typescript/typescript-utils';

const REACT_COMPONENT_TYPES = [
	'Component',
	'ComponentClass',
	'PureComponent',
	'StatelessComponent'
];

export interface PatternInfo {
	declarationPath: string;
	directory: string;
	iconPath?: string;
	implementationPath: string;
}

export class TypescriptReactAnalyzer extends StyleguideAnalyzer {
	public analyze(styleguide: Styleguide): void {
		const directory = new Directory(styleguide.getPath());
		const allPatternInfos: PatternInfo[] = this.findPatterns(directory, directory, true);
		const declarationPaths: string[] = allPatternInfos.map(info => info.declarationPath);
		const program: ts.Program = ts.createProgram(declarationPaths, {});

		this.analyzeFolder(
			styleguide,
			styleguide.getPath(),
			styleguide.getPatternRoot() as PatternFolder,
			program
		);
	}

	private analyzeFolder(
		styleguide: Styleguide,
		path: string,
		folder: PatternFolder,
		program: ts.Program,
		rootPath?: string
	): void {
		const directory = new Directory(path);
		const rootDirectory = rootPath ? new Directory(rootPath) : directory;

		for (const patternInfo of this.findPatterns(rootDirectory, directory, false)) {
			const sourceFile = program.getSourceFile(patternInfo.declarationPath);
			if (!sourceFile) {
				continue;
			}

			const exports: Export[] = TypescriptUtils.getExports(sourceFile, program);
			exports.forEach(exportInfo => {
				const reactType: Type | undefined = this.findWellKnownReactType(
					program,
					exportInfo.type
				);
				const propType = reactType ? reactType.getTypeArguments()[0] : undefined;
				if (!propType) {
					return;
				}

				const id = this.generatePatternId(rootDirectory.getPath(), patternInfo, exportInfo);
				const name = this.getPatternName(patternInfo, exportInfo);
				const pattern = new Pattern(
					id,
					name,
					this.getPatternType(),
					patternInfo.implementationPath,
					exportInfo.name
				);
				pattern.setIconPath(patternInfo.iconPath);

				const properties: Property[] = PropertyAnalyzer.analyze(
					propType.type,
					propType.typeChecker
				);
				for (const property of properties) {
					pattern.addProperty(property);
				}

				folder.addPattern(pattern);
				styleguide.addPattern(pattern);
			});
		}

		for (const subdirectory of directory.getDirectories()) {
			if (subdirectory.getName().toLowerCase() === 'node_modules') {
				continue;
			}

			this.analyzeFolder(
				styleguide,
				subdirectory.getPath(),
				new PatternFolder(subdirectory.getName(), folder),
				program,
				rootDirectory.getPath()
			);
		}
	}

	private findPatterns(
		rootDirectory: Directory,
		directory: Directory,
		recurse: boolean
	): PatternInfo[] {
		let patterns: PatternInfo[] = [];

		for (const declarationPath of directory.getFiles()) {
			if (!declarationPath.endsWith('.d.ts') || declarationPath.endsWith('demo.d.ts')) {
				continue;
			}

			const name = PathUtils.basename(declarationPath, '.d.ts');
			const implementationPath = PathUtils.join(directory.getPath(), `${name}.js`);

			let iconPath: string | undefined = PathUtils.join(directory.getPath(), 'icon.svg');
			iconPath = PathUtils.relative(rootDirectory.getPath(), iconPath);
			iconPath = PathUtils.join(rootDirectory.getPath(), '../../patterns', iconPath);
			iconPath = PathUtils.resolve(rootDirectory.getPath(), iconPath);
			iconPath = FileUtils.existsSync(iconPath) ? iconPath : undefined;

			if (FileUtils.existsSync(implementationPath)) {
				patterns.push({
					directory: directory.getPath(),
					declarationPath,
					implementationPath,
					iconPath
				});
			}
		}

		if (recurse) {
			for (const subdirectory of directory.getDirectories()) {
				if (subdirectory.getName().toLowerCase() === 'node_modules') {
					continue;
				}

				patterns = patterns.concat(this.findPatterns(rootDirectory, subdirectory, true));
			}
		}

		return patterns;
	}

	private findWellKnownReactType(program: ts.Program, type: Type): Type | undefined {
		if (this.isReactType(program, type.type)) {
			return type;
		}

		for (const baseType of type.getBaseTypes()) {
			const wellKnownReactType = this.findWellKnownReactType(program, baseType);

			if (wellKnownReactType) {
				return wellKnownReactType;
			}
		}

		return undefined;
	}

	private generatePatternId(basePath: string, fileInfo: PatternInfo, exportInfo: Export): string {
		const baseName = PathUtils.basename(fileInfo.implementationPath, '.js');
		const relativePath = PathUtils.relative(basePath, fileInfo.directory);
		const absolutePath = PathUtils.join(relativePath, baseName);

		const baseIdentifier = absolutePath.split(PathUtils.sep).join('/');

		const exportIdentifier = exportInfo.name ? `@${exportInfo.name}` : '';
		return `${baseIdentifier}${exportIdentifier}`;
	}

	private getPatternName(fileInfo: PatternInfo, exportInfo: Export): string {
		const baseName = PathUtils.basename(fileInfo.implementationPath, '.js');
		const directoryName = PathUtils.basename(fileInfo.directory);
		return exportInfo.name || (baseName !== 'index' ? baseName : directoryName);
	}

	public getPatternType(): string {
		return 'react';
	}

	private isReactType(program: ts.Program, type: ts.Type): boolean {
		if (!(type.symbol && type.symbol.declarations)) {
			return false;
		}

		const symbol = type.symbol;
		const declarations = type.symbol.declarations;

		const isWellKnownType = REACT_COMPONENT_TYPES.some(
			wellKnownReactComponentType => symbol.name === wellKnownReactComponentType
		);

		if (!isWellKnownType) {
			return false;
		}

		for (const declaration of declarations) {
			const sourceFile = declaration.getSourceFile();
			return sourceFile.fileName.includes('react/index.d.ts');
		}

		return false;
	}
}
