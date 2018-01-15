import * as ts from 'typescript';

declare module 'typescript' {
	interface TypeChecker {
		/** ! DANGER ! Internal Typescript Api */
		isArrayLikeType(type: Type): boolean;
	}

	interface Symbol {
		/** ! DANGER ! Internal Typescript Api */
		type?: Type;
	}
}
