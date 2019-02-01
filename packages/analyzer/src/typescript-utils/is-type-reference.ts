import * as TypeScript from 'typescript';

export function isTypeReference(t: TypeScript.Type): t is TypeScript.TypeReference {
	if (!isObjectType(t)) {
		return false;
	}

	// tslint:disable-next-line:no-bitwise
	return (t.objectFlags & TypeScript.ObjectFlags.Reference) === TypeScript.ObjectFlags.Reference;
}

function isObjectType(t: TypeScript.Type): t is TypeScript.ObjectType {
	// tslint:disable-next-line:no-bitwise
	return (t.flags & TypeScript.TypeFlags.Object) === TypeScript.TypeFlags.Object;
}
