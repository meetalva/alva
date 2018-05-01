import * as Fs from 'fs';
import * as JsYaml from 'js-yaml';

/**
 * A value in a JSON object serialization.
 */
export type JsonValue =
	| string
	| number
	| boolean
	| undefined
	| null
	| Date
	| JsonObject
	| JsonArray;

/**
 * A JSON object serialization, used to persist store models such as pages or preferences.
 * The JSON object narrows JavaScript objects to those capable of direct serialization.
 * JSON objects support JSON.stringify and JSON.parse without data loss.
 * Nevertheless, Alva uses YAML are persistence for less git conflicts.
 */
export interface JsonObject {
	[key: string]: JsonValue;
}

/**
 * An array in a JSON object serializtion.
 */
export interface JsonArray extends Array<JsonValue> {}

/**
 * Persistence tool to read or write JSON objects from or to files (YAML).
 */
export class Persister {
	/**
	 * Loads a given YAML file into a JSON object.
	 * Supports to try to parse it as JSON as a fallback.
	 * @param path The absolute and OS-dependent file-system path to the file.
	 * @return The parsed JSON object.
	 */
	public static loadYamlOrJson(path: string): JsonObject {
		try {
			const fileContent: string = Fs.readFileSync(path, 'utf8');
			return JsYaml.safeLoad(fileContent, JsYaml.JSON_SCHEMA) as JsonObject;
		} catch (error) {
			const fileContent: string = Fs.readFileSync(path.replace('.yaml', '.json'), 'utf8');
			return JSON.parse(fileContent) as JsonObject;
		}
	}

	/**
	 * Saves a given JSON object to a YAML file.
	 * @param path The absolute and OS-dependent file-system path to the file.
	 * @param jsonObject The JSON object to write.
	 */
	public static saveYaml(path: string, jsonObject: JsonObject): void {
		const fileContent: string = JsYaml.safeDump(jsonObject, { skipInvalid: true, noRefs: true });
		Fs.writeFileSync(path, fileContent, 'utf8');
	}
}
