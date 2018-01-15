// tslint:disable:no-bitwise

import * as ts from 'typescript';

export class Type {
	public readonly type: ts.Type;
	public readonly typeChecker: ts.TypeChecker;
	public readonly origin: ts.Node;

	public get name(): string | undefined {
		return this.type.symbol && this.type.symbol.name;
	}

	public constructor(type: ts.Type, typechecker: ts.TypeChecker, origin: ts.Node) {
		this.type = type;
		this.typeChecker = typechecker;
	}

	// TODO: Propagate type arguments to base types
	public get baseTypes(): Type[] {
		let baseTypes = this.type.getBaseTypes();

		if (!baseTypes) {
			const originalType = getOriginalType(this.type, this.typeChecker);

			if (originalType) {
				baseTypes = originalType.getBaseTypes();
			}
		}

		if (!baseTypes) {
			return [];
		}

		return baseTypes.map(baseType => new Type(baseType, this.typeChecker, this.origin));
	}

	public get typeArguments(): Type[] {
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

	public get isConstructable(): boolean {
		if (!this.type.symbol) {
			return false;
		}

		return (this.type.symbol.flags & ts.SymbolFlags.Class) === ts.SymbolFlags.Class;
	}
}

function getOriginalType(type: ts.Type, typechecker: ts.TypeChecker): ts.Type | undefined {
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
