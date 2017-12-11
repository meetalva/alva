export type JsonValue =
	| string
	| number
	| boolean
	| undefined
	| null
	| Date
	| JsonObject
	| JsonArray;

export interface JsonObject {
	[key: string]: JsonValue;
}

export interface JsonArray extends Array<JsonValue> {}
