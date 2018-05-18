import { createCompiler } from '../../compiler';
import { Directory } from '../directory';
import * as Fs from 'fs';
import * as Path from 'path';
import * as PropertyAnalyzer from './property-analyzer';
import * as ReactUtils from '../typescript/react-utils';
import * as SlotAnalyzer from './slot-analzyer';
import * as Types from '../../model/types';
import * as ts from 'typescript';
import * as TypeScript from '../typescript';
import { TypeScriptType } from '../typescript/typescript-type';
import * as TypescriptUtils from '../typescript/typescript-utils';
import * as Util from 'util';
import * as uuid from 'uuid';

export interface PatternInfo {
	declarationPath: string;
	directory: string;
	iconPath?: string;
	implementationPath: string;
}

interface AggregatedPatternInfo {
	exportInfo: TypeScript.TypescriptExport;
	patternInfo: PatternInfo;
}

export async function analyze(path: string): Promise<Types.LibraryAnalysis> {
	const directory = new Directory(path);
	const allPatternInfos: PatternInfo[] = findPatterns(directory, directory, true);
	const declarationPaths: string[] = allPatternInfos.map(info => info.declarationPath);
	const program: ts.Program = ts.createProgram(declarationPaths, {});
	const patterns = analyzeFolder(path, program);

	const compiler = createCompiler(patterns.map(item => item.pattern), { cwd: path });
	await Util.promisify(compiler.run).bind(compiler)();

	return {
		patterns,
		path,
		bundle: (compiler.outputFileSystem as typeof Fs).readFileSync('/components.js').toString()
	};
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
function analyzeFolder(
	path: string,
	program: ts.Program,
	rootPath?: string
): Types.PatternAnalysis[] {
	const directory = new Directory(path);
	const rootDirectory = rootPath ? new Directory(rootPath) : directory;

	return findPatterns(rootDirectory, directory, true)
		.reduce<AggregatedPatternInfo[]>((acc, patternInfo) => {
			const sourceFile = program.getSourceFile(patternInfo.declarationPath);

			if (!sourceFile) {
				return acc;
			}

			TypescriptUtils.getExports(sourceFile, program).forEach(exportInfo => {
				acc.push({ exportInfo, patternInfo });
			});

			return acc;
		}, [])
		.map(({ exportInfo, patternInfo }) => {
			const reactType: TypeScriptType | undefined = ReactUtils.findReactComponentType(
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

			const [propTypes] = reactTypeArguments;
			const properties = PropertyAnalyzer.analyze(propTypes.type, program);
			const slots = SlotAnalyzer.analyzeSlots(propTypes.type, program);

			return {
				pattern: {
					exportName: exportInfo.name,
					id: uuid.v4(),
					name: getPatternName(patternInfo, exportInfo),
					path: patternInfo.implementationPath,
					propertyIds: properties.map(p => p.id),
					slots,
					type: 'pattern'
				},
				properties
			};
		})
		.filter((analysis): analysis is Types.PatternAnalysis => typeof analysis !== 'undefined');
}

/**
 * Analyzes one directory of the styleguide (optionally recursively), returning information about
 * found pattern.
 * @param rootDirectory A directory of the styleguide pattern implementations root path.
 * @param directory The directory to analyze.
 * @param recurse The directory to analyze.
 * @return Information about the patterns found.
 */
function findPatterns(
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

			patterns = patterns.concat(findPatterns(rootDirectory, subdirectory, true));
		}
	}

	return patterns;
}

/**
 * Generate the pattern name from its file and export info.
 * @param fileInfo The pattern file info (implementation/declaration reference).
 * @param exportInfo Information about the pattern export.
 * @return The pattern name.
 */
function getPatternName(fileInfo: PatternInfo, exportInfo: TypeScript.TypescriptExport): string {
	const baseName = Path.basename(fileInfo.implementationPath, '.js');
	const directoryName = Path.basename(fileInfo.directory);
	return exportInfo.name || (baseName !== 'index' ? baseName : directoryName);
}
