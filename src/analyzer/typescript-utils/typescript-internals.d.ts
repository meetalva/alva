import * as ts from 'typescript';

declare module 'typescript' {
	interface TypeChecker {
		/**
		 * DANGER: TypeScript API marked as internal
		 * https://github.com/Microsoft/TypeScript/blob/d9b93903c035e48c8da1d731332787f83efc4619/src/compiler/types.ts#L3062
		 * */
		isArrayLikeType(type: Type): boolean;

		/**
		 * DANGER: TypeScript API marked as internal
		 * https://github.com/Microsoft/TypeScript/blob/d9b93903c035e48c8da1d731332787f83efc4619/src/compiler/types.ts#L3076
		 * */
		getAccessibleSymbolChain(
			symbol: Symbol,
			enclosingDeclaration: Node | undefined,
			meaning: SymbolFlags,
			useOnlyExternalAliasing: boolean
		): Symbol[] | undefined;
	}
}
