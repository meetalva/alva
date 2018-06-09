import { findDeclaration } from './find-declaration';
import * as TypeScript from 'typescript';
import { TypescriptExport } from './typescript-export';
import { TypeScriptType } from './typescript-type';

export function getExportInfos(
	program: TypeScript.Program,
	statement: TypeScript.Statement
): TypescriptExport[] {
	const typechecker = program.getTypeChecker();

	const modifiers = statement.modifiers;
	const isDefault =
		modifiers &&
		modifiers.some(modifier => modifier.kind === TypeScript.SyntaxKind.DefaultKeyword);

	if (TypeScript.isVariableStatement(statement)) {
		for (const declaration of statement.declarationList.declarations) {
			if (!declaration.type) {
				continue;
			}

			const exportName = isDefault ? undefined : declaration.name.getText();

			const type = typechecker.getTypeAtLocation(declaration);
			const exportType = new TypeScriptType(type, typechecker);

			return [
				{
					name: exportName,
					type: exportType,
					statement
				}
			];
		}
	}

	if (TypeScript.isClassDeclaration(statement)) {
		if (!statement.name) {
			return [];
		}

		const exportName = isDefault ? undefined : statement.name.text;

		const type = typechecker.getTypeAtLocation(statement);
		const exportType = new TypeScriptType(type, typechecker);

		return [
			{
				name: exportName,
				type: exportType,
				statement
			}
		];
	}

	if (TypeScript.isExportAssignment(statement)) {
		const expression = statement.expression;
		const declaration = findDeclaration(expression);

		if (declaration) {
			const type = typechecker.getTypeAtLocation(declaration);
			const exportType = new TypeScriptType(type, typechecker);

			return [
				{
					type: exportType,
					statement
				}
			];
		}
	}

	if (TypeScript.isExportDeclaration(statement)) {
		if (!statement.exportClause) {
			return [];
		}

		return statement.exportClause.elements.map(exportSpecifier => {
			const exportName = isDefault ? undefined : exportSpecifier.name.getText();

			const type = typechecker.getTypeAtLocation(exportSpecifier);
			const exportType = new TypeScriptType(type, typechecker);

			return {
				name: exportName,
				type: exportType,
				statement
			};
		});
	}

	return [];
}
