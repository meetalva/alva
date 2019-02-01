// tslint:disable:no-bitwise
import { hasReactTypings } from './has-react-typings';
import * as TypeScript from 'typescript';
import { isUnionType } from '../typescript-utils/is-union-type';
import { isTypeReference } from '../typescript-utils/is-type-reference';

const REACT_SLOT_TYPES = ['Element', 'ReactElement', 'ReactNode', 'ReactNodeArray', 'ReactChild'];

export function isReactSlotType(
	type: TypeScript.Type,
	ctx: { program: TypeScript.Program }
): boolean {
	if (isUnionType(type)) {
		return type.types.some(typeMember => isReactSlotType(typeMember, ctx));
	}

	const typechecker = ctx.program.getTypeChecker();
	const symbol = type.aliasSymbol || type.symbol || type.getSymbol();

	if (!symbol) {
		return false;
	}

	const resolvedSymbol =
		(symbol.flags & TypeScript.SymbolFlags.AliasExcludes) === TypeScript.SymbolFlags.AliasExcludes
			? typechecker.getAliasedSymbol(symbol)
			: symbol;

	if (resolvedSymbol.name === 'Array' && isTypeReference(type) && type.typeArguments) {
		const arg = type.typeArguments[0]!;

		if (!arg) {
			return false;
		}

		return isReactSlotType(arg, ctx);
	}

	if (!REACT_SLOT_TYPES.includes(resolvedSymbol.name)) {
		return false;
	}

	const decls = resolvedSymbol.getDeclarations();

	if (!decls) {
		return false;
	}

	return hasReactTypings(decls);
}
