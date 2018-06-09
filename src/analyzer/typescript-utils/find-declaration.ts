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
		.reduce(
			(result, statement: TypeScript.VariableStatement) => [
				...result,
				...statement.declarationList.declarations
			],
			[]
		)
		.find(declaration => declaration.name.getText() === expression.getText());
}
