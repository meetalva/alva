// tslint:disable:no-bitwise
import { isReactComponentType } from './is-react-component-type';
import * as TypeScript from 'typescript';
import { TypeScriptType } from '../typescript-utils';

/**
 * Takes a type and tries to resolve it to a well-known (Alva supported) React component type,
 * walking through all of its base types and checking against a list of known types.
 * @param program The TypeScript program containing all styleguide declarations.
 * @param type The type to resolve to a React component type.
 * @return The well-known (Alva supported) React component type, or undefined if the given type cannot be resolved to one.
 */
export function findReactComponentType(
	type: TypeScriptType,
	ctx: { program: TypeScript.Program }
): TypeScriptType | undefined {
	if (isReactComponentType(type.type, ctx)) {
		return type;
	}

	for (const baseType of type.getBaseTypes()) {
		const wellKnownReactType = findReactComponentType(baseType, ctx);

		if (wellKnownReactType) {
			return wellKnownReactType;
		}
	}

	return;
}
