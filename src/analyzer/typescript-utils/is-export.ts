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

	// tslint:disable-next-line:no-any
	const modifiers = TypeScript.getCombinedModifierFlags(node as any);

	if ((modifiers & TypeScript.ModifierFlags.Export) === TypeScript.ModifierFlags.Export) {
		return true;
	}

	return false;
}
