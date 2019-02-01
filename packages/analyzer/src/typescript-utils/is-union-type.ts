import * as TypeScript from 'typescript';

export function isUnionType(t: TypeScript.Type): t is TypeScript.UnionType {
	// tslint:disable-next-line:no-bitwise
	return (t.flags & TypeScript.TypeFlags.Union) === TypeScript.TypeFlags.Union;
}
