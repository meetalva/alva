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

	const jsDocTags = TypeScript.getJSDocTags(statement);
	const exportIgnore = jsDocTags.some(tag => tag.tagName.escapedText === 'ignore');

	const descriptionTag = jsDocTags.find(tag => tag.tagName.escapedText === 'description');
	const exportDescription = descriptionTag ? descriptionTag.comment : '';

	if (TypeScript.isVariableStatement(statement)) {
		for (const declaration of statement.declarationList.declarations) {
			if (!declaration.type) {
				continue;
			}

			const type = typechecker.getTypeAtLocation(declaration);
			const exportType = new TypeScriptType(type, typechecker);

			const nameTag = jsDocTags.find(tag => tag.tagName.escapedText === 'name');
			const exportName = nameTag
				? nameTag.comment
				: isDefault
					? undefined
					: declaration.name.getText();

			return [
				{
					name: exportName,
					description: exportDescription || '',
					type: exportType,
					ignore: exportIgnore,
					statement
				}
			];
		}
	}

	if (TypeScript.isClassDeclaration(statement)) {
		if (!statement.name) {
			return [];
		}

		const type = typechecker.getTypeAtLocation(statement);
		const exportType = new TypeScriptType(type, typechecker);

		const nameTag = jsDocTags.find(tag => tag.tagName.escapedText === 'name');
		const exportName = nameTag ? nameTag.comment : isDefault ? undefined : statement.name.text;

		return [
			{
				name: exportName,
				description: exportDescription || '',
				type: exportType,
				ignore: exportIgnore,
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

			const nameTag = jsDocTags.find(tag => tag.tagName.escapedText === 'name');
			const exportName = nameTag ? nameTag.comment : undefined;

			return [
				{
					name: exportName,
					description: exportDescription || '',
					type: exportType,
					ignore: exportIgnore,
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
			const type = typechecker.getTypeAtLocation(exportSpecifier);
			const exportType = new TypeScriptType(type, typechecker);

			const nameTag = jsDocTags.find(tag => tag.tagName.escapedText === 'name');
			const exportName = nameTag
				? nameTag.comment
				: isDefault
					? undefined
					: exportSpecifier.name.getText();

			return {
				name: exportName,
				description: exportDescription || '',
				type: exportType,
				ignore: exportIgnore,
				statement
			};
		});
	}

	return [];
}
