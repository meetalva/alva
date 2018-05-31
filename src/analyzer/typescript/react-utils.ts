// tslint:disable:no-bitwise
import * as TypeScript from 'typescript';
import { TypeScriptType } from './typescript-type';

const REACT_COMPONENT_TYPES = [
	'Component',
	'ComponentClass',
	'PureComponent',
	'StatelessComponent'
];

const REACT_SLOT_TYPES = ['Element', 'ReactNode', 'ReactChild'];

/**
 * Takes a type and tries to resolve it to a well-known (Alva supported) React component type,
 * walking through all of its base types and checking against a list of known types.
 * @param program The TypeScript program containing all styleguide declarations.
 * @param type The type to resolve to a React component type.
 * @return The well-known (Alva supported) React component type, or undefined if the given type cannot be resolved to one.
 */
export function findReactComponentType(
	program: TypeScript.Program,
	type: TypeScriptType
): TypeScriptType | undefined {
	if (isReactComponentType(program, type.type)) {
		return type;
	}

	for (const baseType of type.getBaseTypes()) {
		const wellKnownReactType = findReactComponentType(program, baseType);

		if (wellKnownReactType) {
			return wellKnownReactType;
		}
	}

	return;
}

export function hasDeclarationInReactTypingsFile(declarations: TypeScript.Declaration[]): boolean {
	return declarations
		.map(decl => decl.getSourceFile())
		.some(sourceFile => sourceFile.fileName.endsWith('react/index.d.ts'));
}

/**
 * Returns whether a given type is a well-known (Alva supported) React component type,
 * without traversing through the base types.
 * @param program The TypeScript program containing all styleguide declarations.
 * @param type The type to analyze.
 * @return Whether a given type is a well-known (Alva supported) React component type,
 */
function isReactComponentType(program: TypeScript.Program, type: TypeScript.Type): boolean {
	const symbol = type.getSymbol();

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

	return hasDeclarationInReactTypingsFile(declarations);
}

/**
 * Test if the provided type is assignable to a react node.
 * @param program The TypeScript program.
 * @param type The type to test against react node type.
 */
export function isSlotType(program: TypeScript.Program, type: TypeScript.Type): boolean {
	const typechecker = program.getTypeChecker();
	const symbol = type.aliasSymbol || type.symbol || type.getSymbol();

	if (!symbol) {
		return false;
	}

	const resolvedSymbol =
		symbol.flags & TypeScript.SymbolFlags.AliasExcludes
			? typechecker.getAliasedSymbol(symbol)
			: symbol;

	if (!REACT_SLOT_TYPES.includes(resolvedSymbol.name)) {
		return false;
	}

	const decls = resolvedSymbol.getDeclarations();

	if (!decls) {
		return false;
	}

	return hasDeclarationInReactTypingsFile(decls);
}
