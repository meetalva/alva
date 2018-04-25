/**
 * The valid types for each property value, mainly primitives, objects of primitives,
 * page elements, and some arrays.
 */
export type PropertyValue =
	| { [id: string]: PropertyValue }
	| string
	| string[]
	| number
	| number[]
	| boolean
	| undefined
	| null;
