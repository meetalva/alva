// tslint:disable:no-bitwise
import { hasReactTypings } from './has-react-typings';
import * as TypeScript from 'typescript';

const REACT_SLOT_TYPES = ['Element', 'ReactNode', 'ReactChild'];

export function isReactSlotType(
	type: TypeScript.Type,
	ctx: { program: TypeScript.Program }
): boolean {
	const typechecker = ctx.program.getTypeChecker();
	const symbol = type.aliasSymbol || type.symbol || type.getSymbol();

	if (!symbol) {
		return false;
	}

	const resolvedSymbol =
		(symbol.flags & TypeScript.SymbolFlags.AliasExcludes) === TypeScript.SymbolFlags.AliasExcludes
			? typechecker.getAliasedSymbol(symbol)
			: symbol;

	if (!REACT_SLOT_TYPES.includes(resolvedSymbol.name)) {
		return false;
	}

	const decls = resolvedSymbol.getDeclarations();

	if (!decls) {
		return false;
	}

	return hasReactTypings(decls);
}
