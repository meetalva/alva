// tslint:disable:no-bitwise

import { Type } from './type';
import * as ts from 'typescript';

export function getExports(sourceFile: ts.SourceFile, program: ts.Program): Export[] {
	let exports: Export[] = [];

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

export function getExportInfos(program: ts.Program, statement: ts.Statement): Export[] | undefined {
	const typechecker = program.getTypeChecker();

	const modifiers = statement.modifiers;
	const isDefault =
		modifiers && modifiers.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword);

	if (ts.isVariableStatement(statement)) {
		for (const declaration of statement.declarationList.declarations) {
			if (!declaration.type) {
				continue;
			}

			const exportName = isDefault ? undefined : declaration.name.getText();

			const type = typechecker.getTypeAtLocation(declaration);
			const exportType = new Type(type, typechecker, declaration);

			return [
				{
					name: exportName,
					type: exportType,
					statement
				}
			];
		}
	}

	if (ts.isClassDeclaration(statement)) {
		if (!statement.name) {
			return;
		}

		const exportName = isDefault ? undefined : statement.name.text;

		const type = typechecker.getTypeAtLocation(statement);
		const exportType = new Type(type, typechecker, statement);

		return [
			{
				name: exportName,
				type: exportType,
				statement
			}
		];
	}

	if (ts.isExportAssignment(statement)) {
		const expression = statement.expression;
		const declaration = findDeclaration(expression);

		if (declaration) {
			const type = typechecker.getTypeAtLocation(declaration);
			const exportType = new Type(type, typechecker, declaration);

			return [
				{
					type: exportType,
					statement
				}
			];
		}
	}

	if (ts.isExportDeclaration(statement)) {
		if (!statement.exportClause) {
			return;
		}

		return statement.exportClause.elements.map(exportSpecifier => {
			const exportName = isDefault ? undefined : exportSpecifier.name.getText();

			const type = typechecker.getTypeAtLocation(exportSpecifier);
			const exportType = new Type(type, typechecker, exportSpecifier);

			return {
				name: exportName,
				type: exportType,
				statement
			};
		});
	}

	return;
}

export function findDeclaration(expression: ts.Expression): ts.Declaration | undefined {
	const sourceFile = expression.getSourceFile();

	if (!sourceFile) {
		return;
	}

	for (const statement of sourceFile.statements) {
		if (ts.isVariableStatement(statement)) {
			for (const variableDeclaration of statement.declarationList.declarations) {
				if (variableDeclaration.name.getText() === expression.getText()) {
					return variableDeclaration;
				}
			}
		}
	}

	return;
}

export function getExportStatements(sourceFile: ts.SourceFile): ts.Statement[] {
	const exports: ts.Statement[] = [];

	sourceFile.statements.forEach(child => {
		if (isExport(child)) {
			exports.push(child);
		}
	});

	return exports;
}

export function isExport(node: ts.Node): boolean {
	if (ts.isExportAssignment(node) || ts.isExportDeclaration(node) || ts.isExportSpecifier(node)) {
		return true;
	}

	if (!node.modifiers) {
		return false;
	}

	const modifiers = ts.getCombinedModifierFlags(node);
	if ((modifiers & ts.ModifierFlags.Export) === ts.ModifierFlags.Export) {
		return true;
	}

	return false;
}

export function getAst(node: ts.Node): TypeScriptAst {
	return {
		node,
		text: node.getText(),
		kind: node.kind,
		children: node.getChildren().map(getAst)
	};
}

export interface TypeScriptAst {
	text: string;
	node: ts.Node;
	kind: number;
	children: TypeScriptAst[];
}

export interface Export {
	type: Type;
	statement: ts.Statement;
	name?: string;
}
