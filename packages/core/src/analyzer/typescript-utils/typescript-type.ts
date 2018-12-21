// tslint:disable:no-bitwise

import * as ts from 'typescript';

/**
 * A TypeScript type abstraction to enrich the API for the TypeScript styleguide analyzers.
 */
export class TypeScriptType {
	/**
	 * The base TypeScript type.
	 */
	public readonly type: ts.Type;

	/**
	 * The TypeScript type checker used when creating the type.
	 */
	public readonly typeChecker: ts.TypeChecker;

	/**
	 * Creates a new TypeScript type abstraction.
	 * @param type The base TypeScript type.
	 * @param typechecker The TypeScript type checker used when creating the type.
	 */
	public constructor(type: ts.Type, typechecker: ts.TypeChecker) {
		this.type = type;
		this.typeChecker = typechecker;
	}

	/**
	 * Returns all base types of this type, considering the type's original type, as well.
	 * @return The base types of this type.
	 */
	public getBaseTypes(): TypeScriptType[] {
		// TODO: Propagate type arguments to base types

		let baseTypes = this.type.getBaseTypes();

		if (!baseTypes) {
			const originalType = this.getOriginalType();
			if (originalType) {
				baseTypes = originalType.getBaseTypes();
			}
		}

		if (!baseTypes) {
			return [];
		}

		return baseTypes.map(baseType => new TypeScriptType(baseType, this.typeChecker));
	}

	/**
	 * Returns the symbol name of this type.
	 * @return The symbol name of this type.
	 */
	public getName(): string | undefined {
		return this.type.symbol && this.type.symbol.name;
	}

	private getOriginalType(): ts.Type | undefined {
		const symbol = this.type.symbol;
		if (!symbol) {
			return;
		}

		const typeDeclaration = symbol.declarations && symbol.declarations[0];

		if (!typeDeclaration) {
			return;
		}

		// Danger zone: this.typeChecker.getTypeAtLocation
		// assumes typeDeclaration has a parent
		if (!typeDeclaration.parent) {
			return;
		}

		return this.typeChecker.getTypeAtLocation(typeDeclaration);
	}

	/**
	 * Returns the type arguments of the type.
	 * @return The type arguments.
	 */
	public getTypeArguments(): TypeScriptType[] {
		if (this.type.flags & ts.TypeFlags.Object) {
			const typeReferenceType = this.type as ts.TypeReference;
			if (!typeReferenceType.typeArguments) {
				return [];
			}

			return typeReferenceType.typeArguments.map(
				typeArg => new TypeScriptType(typeArg, this.typeChecker)
			);
		}

		if (this.type.flags & ts.TypeFlags.Union) {
			const unionType = this.type as ts.UnionType;
			const typeReferenceType = unionType.types[0] as ts.TypeReference;

			if (!typeReferenceType.typeArguments) {
				return [];
			}

			return typeReferenceType.typeArguments.map(
				typeArg => new TypeScriptType(typeArg, this.typeChecker)
			);
		}

		return [];
	}

	/**
	 * Returns whether this type is constructable.
	 * @return Whether this type is constructable.
	 */
	public isConstructable(): boolean {
		if (!this.type.symbol) {
			return false;
		}

		return (this.type.symbol.flags & ts.SymbolFlags.Class) === ts.SymbolFlags.Class;
	}
}
