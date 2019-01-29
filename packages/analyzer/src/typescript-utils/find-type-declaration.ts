// tslint:disable:no-bitwise
import * as TypeScript from 'typescript';

export function findTypeDeclaration(
	symbol: TypeScript.Symbol,
	ctx: { typechecker: TypeScript.TypeChecker }
): TypeScript.Declaration | undefined {
	const resolved =
		symbol.flags & TypeScript.SymbolFlags.AliasExcludes
			? ctx.typechecker.getAliasedSymbol(symbol)
			: symbol;

	if (resolved.valueDeclaration) {
		return resolved.valueDeclaration;
	}

	const [declaration = null] = resolved.getDeclarations() || [];

	if (declaration) {
		return declaration;
	}

	return;
}
