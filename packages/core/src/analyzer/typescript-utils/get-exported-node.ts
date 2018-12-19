import * as Tsa from 'ts-simple-ast';

export function getExportedNode(symbol: Tsa.Symbol | undefined): Tsa.Node<Tsa.ts.Node> | undefined {
	if (!symbol) {
		return;
	}

	const decl = symbol.getDeclarations()[0];

	if (!decl) {
		return;
	}

	if (Tsa.TypeGuards.isExportAssignment(decl)) {
		const expr = decl.getExpression();

		return Tsa.TypeGuards.isIdentifier(expr)
			? expr.getDefinitionNodes()[0]
			: symbol && symbol.getValueDeclaration();
	}

	return decl;
}
