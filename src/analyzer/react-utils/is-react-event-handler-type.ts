// tslint:disable:no-bitwise
import * as TypeScript from 'typescript';

/**
 * TODO: Change this to a more sane approach where we
 * - pick up the type symbol chain, possibly via typeChecker.getAccessibleSymbolChain
 * - check if _any_ of the symbols in the chain match
 * - we probably should do this for the isSlotType check, too
 * 'Element', 'ReactNode', 'ReactChild',
 */
const REACT_EVENT_HANDLER_TYPES = [
	'bivarianceHack', // See TODO
	'EventHandler',
	'ReactEventHandler',
	'ClipboardEventHandler',
	'CompositionEventHandler',
	'DragEventHandler',
	'FocusEventHandler',
	'FormEventHandler',
	'ChangeEventHandler',
	'KeyboardEventHandler',
	'MouseEventHandler',
	'TouchEventHandler',
	'UIEventHandler',
	'WheelEventHandler',
	'AnimationEventHandler',
	'TransitionEventHandler'
];

const REACT_EVENT_TYPES = [
	'SyntheticEvent',
	'ClipboardEvent',
	'CompositionEvent',
	'DragEvent',
	'FocusEvent',
	'FormEvent',
	'InvalidEvent',
	'ChangeEvent',
	'KeyboardEvent',
	'MouseEvent',
	'TouchEvent',
	'UIEvent',
	'WheelEvent',
	'AnimationEvent',
	'TransitionEvent'
];

export function isReactEventHandlerType(
	type: TypeScript.Type,
	ctx: { program: TypeScript.Program }
): boolean {
	const typechecker = ctx.program.getTypeChecker();
	const apparentType = typechecker.getApparentType(type) || type;
	const symbol = apparentType.aliasSymbol || apparentType.symbol || apparentType.getSymbol();

	if (!symbol) {
		return false;
	}

	const resolvedSymbol =
		(symbol.flags & TypeScript.SymbolFlags.AliasExcludes) === TypeScript.SymbolFlags.AliasExcludes
			? typechecker.getAliasedSymbol(symbol)
			: symbol;

	const declaration = resolvedSymbol.declarations ? resolvedSymbol.declarations[0] : undefined;

	// React.EventHandler<any>
	if (REACT_EVENT_HANDLER_TYPES.includes(resolvedSymbol.name)) {
		return true;
	}

	// onEvent(e: React.MouseEvent<any>): any;
	// onEvent: (e: React.MouseEvent<any>) => any;
	if (
		declaration &&
		(TypeScript.isMethodSignature(declaration) || TypeScript.isFunctionTypeNode(declaration))
	) {
		const eventParameter = declaration.parameters[0];

		if (eventParameter) {
			const eventParameterType = typechecker.getTypeAtLocation(eventParameter);
			const apparentParameterType = typechecker.getApparentType(eventParameterType);
			const apparentParameterSymbol = apparentParameterType.getSymbol();

			if (apparentParameterSymbol && REACT_EVENT_TYPES.includes(apparentParameterSymbol.name)) {
				return true;
			}
		}
	}

	return false;
}
