import * as TypeScript from 'typescript';

export function findDeclaration(
	expression: TypeScript.Expression
): TypeScript.Declaration | undefined {
	const sourceFile = expression.getSourceFile();

	if (!sourceFile) {
		return;
	}

	return sourceFile.statements
		.filter(statement => TypeScript.isVariableStatement(statement))
		.reduce<any[]>(
			(result, statement: any) => [...result, ...statement.declarationList.declarations],
			[]
		)
		.find(
			(declaration: TypeScript.Declaration) =>
				(declaration as any).name.getText() === expression.getText()
		);
}
