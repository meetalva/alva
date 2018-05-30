import * as ts from 'typescript';

declare module 'typescript' {
	interface TypeChecker {
		/** DANGER: Undocumented TypeScript API */
		isArrayLikeType(type: Type): boolean;
	}
}
