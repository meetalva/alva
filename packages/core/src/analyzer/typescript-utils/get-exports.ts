import { getExportInfos } from './get-export-infos';
import { isExport } from './is-export';
import * as TypeScript from 'typescript';
import { TypescriptExport } from './typescript-export';

export function getExports(
	sourceFile: TypeScript.SourceFile,
	program: TypeScript.Program
): TypescriptExport[] {
	return sourceFile.statements
		.filter(isExport)
		.reduce<TypescriptExport[]>(
			(acc, exportStatement) => [...acc, ...getExportInfos(program, exportStatement)],
			[]
		);
}
