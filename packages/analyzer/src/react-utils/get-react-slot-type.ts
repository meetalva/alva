// tslint:disable:no-bitwise
import * as TypeScript from 'typescript';
import { isTypeReference } from '../typescript-utils/is-type-reference';

const REACT_SLOT_TYPES_SINGLE = ['Element', 'ReactElement', 'ReactChild'];

export function getReactSlotType(
	type: TypeScript.Type,
	ctx: { program: TypeScript.Program }
): string | undefined {
	const typechecker = ctx.program.getTypeChecker();
	const symbol = type.aliasSymbol || type.symbol || type.getSymbol();

	if (!symbol) {
		return;
	}

	const resolvedSymbol =
		(symbol.flags & TypeScript.SymbolFlags.AliasExcludes) === TypeScript.SymbolFlags.AliasExcludes
			? typechecker.getAliasedSymbol(symbol)
			: symbol;

	if (resolvedSymbol.name === 'Array' && isTypeReference(type) && type.typeArguments) {
		const arg = type.typeArguments[0]!;

		if (!arg) {
			return;
		}

		return getReactSlotType(arg, ctx);
	}

	if (REACT_SLOT_TYPES_SINGLE.includes(resolvedSymbol.name)) {
		return 'single';
	}

	return 'multiple';
}
