import { JsonObject } from '../../../json';

/**
 * The first parameter of these functions must be the DOM event (e.g. click, change).
 */
export abstract class EventAction {
	/**
	 * Serializes the event action into a JSON object for persistence or transport.
	 * @return The JSON object to be persisted.
	 */
	public abstract toJsonObject(): JsonObject;
}
