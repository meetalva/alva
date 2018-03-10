// tslint:disable:no-bitwise

import * as ts from 'typescript';

export class Type {
	public readonly type: ts.Type;
	public readonly typeChecker: ts.TypeChecker;
	public readonly origin: ts.Node;

	public constructor(type: ts.Type, typechecker: ts.TypeChecker, origin: ts.Node) {
		this.type = type;
		this.typeChecker = typechecker;
	}

	// TODO: Propagate type arguments to base types
	public getBaseTypes(): Type[] {
		let baseTypes = this.type.getBaseTypes();

		if (!baseTypes) {
			const originalType = this.getOriginalType(this.type, this.typeChecker);

			if (originalType) {
				baseTypes = originalType.getBaseTypes();
			}
		}

		if (!baseTypes) {
			return [];
		}

		return baseTypes.map(baseType => new Type(baseType, this.typeChecker, this.origin));
	}

	public getName(): string | undefined {
		return this.type.symbol && this.type.symbol.name;
	}

	private getOriginalType(type: ts.Type, typechecker: ts.TypeChecker): ts.Type | undefined {
		if (!type.symbol) {
			return;
		}

		const typeDeclaration = type.symbol.declarations && type.symbol.declarations[0];

		if (!typeDeclaration) {
			return;
		}

		const realType = typechecker.getTypeAtLocation(typeDeclaration);
		return realType;
	}

	public getTypeArguments(): Type[] {
		if (!(this.type.flags & ts.TypeFlags.Object)) {
			return [];
		}

		const typeReferenceType = this.type as ts.TypeReference;

		if (!typeReferenceType.typeArguments) {
			return [];
		}

		return typeReferenceType.typeArguments.map(
			typeArg => new Type(typeArg, this.typeChecker, this.origin)
		);
	}

	public isConstructable(): boolean {
		if (!this.type.symbol) {
			return false;
		}

		return (this.type.symbol.flags & ts.SymbolFlags.Class) === ts.SymbolFlags.Class;
	}
}
