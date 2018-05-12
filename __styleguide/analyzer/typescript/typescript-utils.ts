// tslint:disable:no-bitwise

import { Export } from './export';
import { Type } from './type';
import * as ts from 'typescript';

export class TypescriptUtils {
	public static findDeclaration(expression: ts.Expression): ts.Declaration | undefined {
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

	/**
	 * Returns a TypeScript type declaration for a given symbol.
	 * @param symbol The symbol to return the declaration for.
	 * @return TypeScript type declaration.
	 */
	public static findTypeDeclaration(symbol: ts.Symbol): ts.Declaration | undefined {
		if (symbol.valueDeclaration) {
			return symbol.valueDeclaration;
		}

		if (symbol.declarations) {
			return symbol.declarations[0];
		}

		if (symbol.type && symbol.type.symbol) {
			return this.findTypeDeclaration(symbol.type.symbol);
		}

		return;
	}

	public static getExportInfos(
		program: ts.Program,
		statement: ts.Statement
	): Export[] | undefined {
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
				const exportType = new Type(type, typechecker);

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
			const exportType = new Type(type, typechecker);

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
			const declaration = this.findDeclaration(expression);

			if (declaration) {
				const type = typechecker.getTypeAtLocation(declaration);
				const exportType = new Type(type, typechecker);

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
				const exportType = new Type(type, typechecker);

				return {
					name: exportName,
					type: exportType,
					statement
				};
			});
		}

		return;
	}

	public static getExports(sourceFile: ts.SourceFile, program: ts.Program): Export[] {
		let exports: Export[] = [];

		const exportStatements = this.getExportStatements(sourceFile);

		exportStatements.forEach(statement => {
			const exportInfos = this.getExportInfos(program, statement);

			if (!exportInfos) {
				return;
			}

			exports = exports.concat(exportInfos);
		});

		return exports;
	}

	public static getExportStatements(sourceFile: ts.SourceFile): ts.Statement[] {
		const exports: ts.Statement[] = [];

		sourceFile.statements.forEach(child => {
			if (this.isExport(child)) {
				exports.push(child);
			}
		});

		return exports;
	}

	public static isExport(node: ts.Node): boolean {
		if (
			ts.isExportAssignment(node) ||
			ts.isExportDeclaration(node) ||
			ts.isExportSpecifier(node)
		) {
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
}
