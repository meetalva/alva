import * as TypeScript from 'typescript';

export function hasReactTypings(declarations: TypeScript.Declaration[]): boolean {
	return declarations
		.map(decl => decl.getSourceFile())
		.some(sourceFile => sourceFile.fileName.endsWith('react/index.d.ts'));
}
