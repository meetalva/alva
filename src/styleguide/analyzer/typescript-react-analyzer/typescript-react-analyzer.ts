import { Directory } from '../directory';
import { Export } from '../typescript/export';
import { PatternFolder } from '../../../store/styleguide/folder';
import * as Fs from 'fs';
import * as Path from 'path';
import { Pattern } from '../../../store/styleguide/pattern';
import { Property } from '../../../store/styleguide/property/property';
import { PropertyAnalyzer } from './property-analyzer';
import { ReactUtils } from '../typescript/react-utils';
import { Slot } from '../../../store/styleguide/slot';
import { SlotAnalyzer } from './slot-analzyer';
import { Styleguide } from '../../../store/styleguide/styleguide';
import { StyleguideAnalyzer } from '../styleguide-analyzer';
import { Type } from '../typescript/type';
import * as ts from 'typescript';
import { TypescriptUtils } from '../typescript/typescript-utils';

export interface PatternInfo {
	declarationPath: string;
	directory: string;
	iconPath?: string;
	implementationPath: string;
}

/**
 * A styleguide analyzer for TypeScript React patterns.
 */
export class Analyzer extends StyleguideAnalyzer {
	/**
	 * @inheritdoc
	 */
	public analyze(styleguide: Styleguide): void {
		const directory = new Directory(styleguide.getPatternsPath());
		const allPatternInfos: PatternInfo[] = this.findPatterns(directory, directory, true);
		const declarationPaths: string[] = allPatternInfos.map(info => info.declarationPath);
		const program: ts.Program = ts.createProgram(declarationPaths, {});

		this.analyzeFolder(
			styleguide,
			styleguide.getPatternsPath(),
			styleguide.getPatternRoot(),
			program
		);
	}

	/**
	 * Analyzes a folder of the styleguide and its subfolders. Called from the root analysis, and
	 * then recursively from its children.
	 * @param styleguide The styleguide to add patterns to.
	 * @param path The path of the folder to analyze.
	 * @param folder The parent pattern folder to add subfolders and patterns to.
	 * @param program The TypeScript program containing all pattern declarations.
	 * @param rootPath The root path of the styleguide pattern implementations.
	 */
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
				const reactType: Type | undefined = ReactUtils.findReactComponentType(
					program,
					exportInfo.type
				);

				if (!reactType) {
					return;
				}

				const reactTypeArguments = reactType.getTypeArguments();

				if (reactTypeArguments.length === 0) {
					return;
				}

				const propType = reactTypeArguments[0];

				const id = this.getPatternId(rootDirectory.getPath(), patternInfo, exportInfo);
				const name = this.getPatternName(patternInfo, exportInfo);
				const pattern = new Pattern(id, name, patternInfo.implementationPath, exportInfo.name);
				pattern.setIconPath(patternInfo.iconPath);

				const properties: Property[] = PropertyAnalyzer.analyze(
					propType.type,
					propType.typeChecker
				);

				for (const property of properties) {
					pattern.addProperty(property);
				}

				const slots: Slot[] = SlotAnalyzer.analyzeSlots(propType.type, program);

				for (const slot of slots) {
					pattern.addSlot(slot);
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

	/**
	 * Analyzes one directory of the styleguide (optionally recursively), returning information about
	 * found pattern.
	 * @param rootDirectory A directory of the styleguide pattern implementations root path.
	 * @param directory The directory to analyze.
	 * @param recurse The directory to analyze.
	 * @return Information about the patterns found.
	 */
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

			const name = Path.basename(declarationPath, '.d.ts');
			const implementationPath = Path.join(directory.getPath(), `${name}.js`);

			let iconPath: string | undefined = Path.join(directory.getPath(), 'icon.svg');
			iconPath = Path.relative(rootDirectory.getPath(), iconPath);
			iconPath = Path.join(rootDirectory.getPath(), '../../patterns', iconPath);
			iconPath = Path.resolve(rootDirectory.getPath(), iconPath);
			iconPath = Fs.existsSync(iconPath) ? iconPath : undefined;

			if (Fs.existsSync(implementationPath)) {
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

	/**
	 * Generate the TypeScript React analyzer specific pattern ID from the pattern's file and export
	 * info.
	 * @param rootPath The root path of the styleguide pattern implementations.
	 * @param fileInfo The pattern file info (implementation/declaration reference).
	 * @param exportInfo Information about the pattern export.
	 * @return The pattern ID to use.
	 */
	private getPatternId(rootPath: string, fileInfo: PatternInfo, exportInfo: Export): string {
		const baseName = Path.basename(fileInfo.implementationPath, '.js');
		const relativePath = Path.relative(rootPath, fileInfo.directory);
		const absolutePath = Path.join(relativePath, baseName);
		const baseIdentifier = absolutePath.split(Path.sep).join('/');
		const exportIdentifier = exportInfo.name ? `@${exportInfo.name}` : '';
		return `${baseIdentifier}${exportIdentifier}`;
	}

	/**
	 * Generate the pattern name from its file and export info.
	 * @param fileInfo The pattern file info (implementation/declaration reference).
	 * @param exportInfo Information about the pattern export.
	 * @return The pattern name.
	 */
	private getPatternName(fileInfo: PatternInfo, exportInfo: Export): string {
		const baseName = Path.basename(fileInfo.implementationPath, '.js');
		const directoryName = Path.basename(fileInfo.directory);
		return exportInfo.name || (baseName !== 'index' ? baseName : directoryName);
	}
}
