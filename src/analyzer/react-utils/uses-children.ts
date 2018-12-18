import * as Tsa from 'ts-simple-ast';

export function usesChildren(node: Tsa.Node, { project }: { project: Tsa.Project }): boolean {
	if (Tsa.TypeGuards.isVariableDeclaration(node)) {
		return usesChildren(node.getInitializer()!, { project });
	}

	if (Tsa.TypeGuards.isFunctionLikeDeclaration(node)) {
		const propsParamDeclaration = node.getParameters()[0];

		if (!propsParamDeclaration) {
			return false;
		}

		return propsParamDeclaration
			.findReferencesAsNodes()
			.map(ref => ref.getParent()!) // TODO: traverse upwards
			.some(ref => {
				if (Tsa.TypeGuards.isPropertyAccessExpression(ref)) {
					return ref.getName() === 'children';
				}
				return false;
			});
	}

	return false;
}
