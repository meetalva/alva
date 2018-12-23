import * as Path from 'path';
import * as Tsa from 'ts-simple-ast';
import { TypescriptExport } from './typescript-export';
import { setExtname } from './set-extname';

export function getTsaExport(
	ex: TypescriptExport,
	{ project }: { project: Tsa.Project }
): Tsa.Symbol | undefined {
	const declPath = (ex.statement.getSourceFile() as any).path;
	const sourcePath = setExtname(declPath, '.ts');
	const sourcePathTSX = setExtname(declPath, '.tsx');

	const compilerOptions = project.getCompilerOptions();
	const relSourcePath = Path.relative((compilerOptions.outDir || '').toLowerCase(), sourcePath);
	const relSourcePathTSX = Path.relative(
		(compilerOptions.outDir || '').toLowerCase(),
		sourcePathTSX
	);

	const sourceFile = project
		.getSourceFiles()
		.find(
			f => f.getFilePath().endsWith(relSourcePath) || f.getFilePath().endsWith(relSourcePathTSX)
		);

	return sourceFile
		? sourceFile.getExportSymbols().find(s => s.getName() === (ex.exportName || 'default'))
		: undefined;
}
