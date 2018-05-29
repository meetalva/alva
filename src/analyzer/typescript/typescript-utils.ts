// tslint:disable:no-bitwise
import * as Ts from 'typescript';
import { TypescriptExport } from './typescript-export';
import { TypeScriptType } from './typescript-type';

export function findDeclaration(expression: Ts.Expression): Ts.Declaration | undefined {
	const sourceFile = expression.getSourceFile();

	if (!sourceFile) {
		return;
	}

	for (const statement of sourceFile.statements) {
		if (Ts.isVariableStatement(statement)) {
			for (const variableDeclaration of statement.declarationList.declarations) {
				if (variableDeclaration.name.getText() === expression.getText()) {
					return variableDeclaration;
				}
			}
		}
	}

	return;
}

/**
 * Returns a TypeScript type declaration for a given symbol.
 * @param symbol The symbol to return the declaration for.
 * @return TypeScript type declaration.
 */
export function findTypeDeclaration(symbol: Ts.Symbol): Ts.Declaration | undefined {
	if (symbol.valueDeclaration) {
		return symbol.valueDeclaration;
	}

	if (symbol.declarations) {
		return symbol.declarations[0];
	}

	if (symbol.type && symbol.type.symbol) {
		return findTypeDeclaration(symbol.type.symbol);
	}

	return;
}

export function getExportInfos(
	program: Ts.Program,
	statement: Ts.Statement
): TypescriptExport[] | undefined {
	const typechecker = program.getTypeChecker();

	const modifiers = statement.modifiers;
	const isDefault =
		modifiers && modifiers.some(modifier => modifier.kind === Ts.SyntaxKind.DefaultKeyword);

	if (Ts.isVariableStatement(statement)) {
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

	if (Ts.isClassDeclaration(statement)) {
		if (!statement.name) {
			return;
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

	if (Ts.isExportAssignment(statement)) {
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

	if (Ts.isExportDeclaration(statement)) {
		if (!statement.exportClause) {
			return;
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

	return;
}

export function getExports(sourceFile: Ts.SourceFile, program: Ts.Program): TypescriptExport[] {
	let exports: TypescriptExport[] = [];

	const exportStatements = getExportStatements(sourceFile);

	exportStatements.forEach(statement => {
		const exportInfos = getExportInfos(program, statement);

		if (!exportInfos) {
			return;
		}

		exports = exports.concat(exportInfos);
	});

	return exports;
}

export function getExportStatements(sourceFile: Ts.SourceFile): Ts.Statement[] {
	const exports: Ts.Statement[] = [];

	sourceFile.statements.forEach(child => {
		if (isExport(child)) {
			exports.push(child);
		}
	});

	return exports;
}

export function isExport(node: Ts.Node): boolean {
	if (Ts.isExportAssignment(node) || Ts.isExportDeclaration(node) || Ts.isExportSpecifier(node)) {
		return true;
	}

	if (!node.modifiers) {
		return false;
	}

	const modifiers = Ts.getCombinedModifierFlags(node);
	if ((modifiers & Ts.ModifierFlags.Export) === Ts.ModifierFlags.Export) {
		return true;
	}

	return false;
}

export function getJsDocValueFromNode(node: Ts.Node, tagName: string): string | undefined {
	const jsdocTag = (Ts.getJSDocTags(node) || []).find(
		tag => tag.tagName && tag.tagName.text === tagName
	);
	return jsdocTag ? (jsdocTag.comment || '').trim() : undefined;
}

export function getJsDocValueFromSymbol(symbol: Ts.Symbol, tagName: string): string | undefined {
	const jsdocTag = symbol.getJsDocTags().find(tag => tag.name === tagName);
	return jsdocTag ? (jsdocTag.text || '').trim() : undefined;
}

export function symbolHasJsDocTag(symbol: Ts.Symbol, tagName: string): boolean {
	return symbol.getJsDocTags().some(tag => tag.name === tagName);
}
