import * as Tsa from 'ts-simple-ast';

export function usesChildren(node: Tsa.Node, { project }: { project: Tsa.Project }): boolean {
	if (Tsa.TypeGuards.isExportAssignment(node)) {
		return usesChildren(node.getExpression(), { project });
	}

	if (Tsa.TypeGuards.isVariableDeclaration(node)) {
		return usesChildren(node.getInitializer()!, { project });
	}

	if (Tsa.TypeGuards.isCallExpression(node)) {
		return node.getArguments().some(arg => usesChildren(arg, { project }));
	}

	if (Tsa.TypeGuards.isIdentifier(node)) {
		return node.getDefinitionNodes().some(definiton => usesChildren(definiton, { project }));
	}

	const childrenProp = getChildrenProp(node);

	if (typeof childrenProp === 'undefined') {
		return false;
	}

	const childrenDecl = childrenProp.getDeclarations()[0] as Tsa.PropertyDeclaration;

	if (!childrenDecl) {
		return false;
	}

	return childrenDecl.findReferencesAsNodes().some(ref => ref.getAncestors().includes(node));
}

function getChildrenProp(node: Tsa.Node): Tsa.Symbol | undefined {
	if (Tsa.TypeGuards.isClassDeclaration(node)) {
		return node
			.getType()
			.getProperties()
			.find(s => s.getName() === 'props');
	}

	if (Tsa.TypeGuards.isFunctionLikeDeclaration(node)) {
		const param = node.getParameters()[0];

		if (!param) {
			return;
		}

		const propType = param.getType();
		return propType.getProperty('children');
	}

	return;
}
