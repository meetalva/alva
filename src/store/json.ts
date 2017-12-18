import * as FileUtils from 'fs';
import * as JsYaml from 'js-yaml';

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

export class Persister {
	public static loadYamlOrJson(path: string): JsonObject {
		const fileContent: string = FileUtils.readFileSync(path, 'utf8');
		try {
			return JsYaml.safeLoad(fileContent, JsYaml.JSON_SCHEMA) as JsonObject;
		} catch (error) {
			return JSON.parse(fileContent) as JsonObject;
		}
	}

	public static saveYaml(path: string, jsonObject: JsonObject): void {
		const fileContent: string = JsYaml.safeDump(jsonObject, { skipInvalid: true, noRefs: true });
		FileUtils.writeFileSync(path, fileContent, 'utf8');
	}
}
