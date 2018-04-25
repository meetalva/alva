// tslint:disable:no-bitwise

import { Type } from './type';
import * as ts from 'typescript';

const REACT_COMPONENT_TYPES = [
	'Component',
	'ComponentClass',
	'PureComponent',
	'StatelessComponent'
];

const REACT_SLOT_TYPES = ['Element', 'ReactNode', 'ReactChild'];

/**
 * Tools to inspect typescript React implementations.
 */
export class ReactUtils {
	/**
	 * Takes a type and tries to resolve it to a well-known (Alva supported) React component type,
	 * walking through all of its base types and checking against a list of known types.
	 * @param program The TypeScript program containing all styleguide declarations.
	 * @param type The type to resolve to a React component type.
	 * @return The well-known (Alva supported) React component type, or undefined if the given type cannot be resolved to one.
	 */
	public static findReactComponentType(program: ts.Program, type: Type): Type | undefined {
		if (this.isReactComponentType(program, type.type)) {
			return type;
		}

		for (const baseType of type.getBaseTypes()) {
			const wellKnownReactType = this.findReactComponentType(program, baseType);

			if (wellKnownReactType) {
				return wellKnownReactType;
			}
		}

		return;
	}

	protected static hasDeclarationInReactTypingsFile(declarations: ts.Declaration[]): boolean {
		for (const declaration of declarations) {
			const sourceFile = declaration.getSourceFile();
			if (sourceFile && sourceFile.fileName.includes('react/index.d.ts')) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns whether a given type is a well-known (Alva supported) React component type,
	 * without traversing through the base types.
	 * @param program The TypeScript program containing all styleguide declarations.
	 * @param type The type to analyze.
	 * @return Whether a given type is a well-known (Alva supported) React component type,
	 */
	private static isReactComponentType(program: ts.Program, type: ts.Type): boolean {
		const symbol = type.symbol;
		if (!symbol || !symbol.declarations) {
			return false;
		}

		const isWellKnownType: boolean = REACT_COMPONENT_TYPES.indexOf(symbol.name) >= 0;
		if (!isWellKnownType) {
			return false;
		}

		return this.hasDeclarationInReactTypingsFile(symbol.declarations);
	}

	/**
	 * Test if the provided type is assignable to a react node.
	 * @param program The TypeScript program.
	 * @param type The type to test against react node type.
	 */
	public static isSlotType(program: ts.Program, type: ts.Type): boolean {
		const typeSymbols: (ts.Symbol | undefined)[] =
			type.symbol || type.aliasSymbol
				? [type.symbol || type.aliasSymbol]
				: type.flags & ts.TypeFlags.Union
					? (type as ts.UnionType).types.map(value => value.aliasSymbol || value.symbol)
					: [];

		for (const typeSymbol of typeSymbols) {
			if (!typeSymbol || !typeSymbol.declarations) {
				continue;
			}

			const isWellKnownType: boolean = REACT_SLOT_TYPES.indexOf(typeSymbol.name) >= 0;
			if (!isWellKnownType) {
				continue;
			}

			if (this.hasDeclarationInReactTypingsFile(typeSymbol.declarations)) {
				return true;
			}
		}

		return false;
	}
}
