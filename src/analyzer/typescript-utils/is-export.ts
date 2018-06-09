// tslint:disable:no-bitwise
import * as TypeScript from 'typescript';

export function isExport(node: TypeScript.Node): boolean {
	if (
		TypeScript.isExportAssignment(node) ||
		TypeScript.isExportDeclaration(node) ||
		TypeScript.isExportSpecifier(node)
	) {
		return true;
	}

	if (!node.modifiers) {
		return false;
	}

	const modifiers = TypeScript.getCombinedModifierFlags(node);
	if ((modifiers & TypeScript.ModifierFlags.Export) === TypeScript.ModifierFlags.Export) {
		return true;
	}

	return false;
}
