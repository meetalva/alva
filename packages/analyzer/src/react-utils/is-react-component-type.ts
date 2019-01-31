import { hasReactTypings } from './has-react-typings';
import * as TypeScript from 'typescript';

const REACT_COMPONENT_TYPES = [
	'Component',
	'ComponentClass',
	'PureComponent',
	'StatelessComponent',
	'ComponentType',
	'FunctionComponent'
];

export function isReactComponentType(
	type: TypeScript.Type,
	ctx: { program: TypeScript.Program }
): boolean {
	const symbol = type.getSymbol() || type.aliasSymbol;

	if (!symbol) {
		return false;
	}

	if (!REACT_COMPONENT_TYPES.includes(symbol.name)) {
		return false;
	}

	const declarations = symbol.getDeclarations();

	if (!declarations) {
		return false;
	}

	return hasReactTypings(declarations);
}
