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

	if (Tsa.TypeGuards.isClassDeclaration(node)) {
		const props = node
			.getType()
			.getProperties()
			.find(s => s.getName() === 'props');

		if (!props) {
			return false;
		}

		const decl = props.getDeclarations()[0] as Tsa.PropertyDeclaration;
		const refs = decl.findReferencesAsNodes();

		return refs
			.filter(ref => isInside(ref, node))
			.map(ref => ref.getParent()!.getParent()!)
			.some(ref => {
				if (Tsa.TypeGuards.isPropertyAccessExpression(ref)) {
					return ref.getName() === 'children';
				}
				return false;
			});
	}

	return false;
}

function isInside(a: Tsa.Node, b: Tsa.Node): boolean {
	let current: Tsa.Node = a;

	// tslint:disable-next-line:no-conditional-assignment
	while ((current = current.getParent())) {
		if (current === b) {
			return true;
		}
	}

	return false;
}
