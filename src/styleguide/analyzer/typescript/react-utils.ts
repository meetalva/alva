import { Type } from './type';
import * as ts from 'typescript';

const REACT_COMPONENT_TYPES = [
	'Component',
	'ComponentClass',
	'PureComponent',
	'StatelessComponent'
];

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

		for (const declaration of symbol.declarations) {
			const sourceFile = declaration.getSourceFile();
			if (sourceFile && sourceFile.fileName.includes('react/index.d.ts')) {
				return true;
			}
		}

		return false;
	}
}
