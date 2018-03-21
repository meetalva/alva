import { JsonObject } from './json';
import * as MobX from 'mobx';

/**
 * The internal data storage for preferences, i.e. personal settings
 * saved in the user's home directory (.alva-prefs.yaml).
 */
export class Preferences {
	/**
	 * The last opened page's ID.
	 */
	@MobX.observable private lastPageId?: string;

	/**
	 * The last selected project's ID.
	 */
	@MobX.observable private lastProjectId?: string;

	/**
	 * The last opened styleguide's absolute path.
	 */
	@MobX.observable private lastStyleguidePath?: string;

	/**
	 * Loads and returns preferences from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @return A new preferences object containing the loaded data.
	 */
	public static fromJsonObject(jsonObject: JsonObject): Preferences {
		const preferences: Preferences = new Preferences();
		preferences.lastStyleguidePath = jsonObject.lastStyleguidePath as string;
		preferences.lastPageId = jsonObject.lastPageId as string;
		return preferences;
	}

	/**
	 * Returns the last opened page's ID.
	 * @return The last opened page's ID.
	 */
	public getLastPageId(): string | undefined {
		return this.lastPageId;
	}

	/**
	 * Returns the last selected project's ID.
	 * @return The last selected project's ID.
	 */
	public getLastProjectId(): string | undefined {
		return this.lastProjectId;
	}

	/**
	 * Returns the last opened styleguide's absolute path.
	 * @return The last opened styleguide's absolute path.
	 */
	public getLastStyleguidePath(): string | undefined {
		return this.lastStyleguidePath;
	}

	/**
	 * Sets the last opened page's ID.
	 * @param lastPageId The last opened page's ID.
	 */
	public setLastPageId(lastPageId?: string): void {
		this.lastPageId = lastPageId;
	}

	/**
	 * Sets the last selected project's ID.
	 * @param lastProjectId The last selected project's ID.
	 */
	public setLastProjectId(lastProjectId?: string): void {
		this.lastProjectId = lastProjectId;
	}

	/**
	 * Sets the last opened styleguide's absolute path.
	 * @param lastStyleguidePath The last opened styleguide's absolute path.
	 */
	public setLastStyleguidePath(lastStyleguidePath?: string): void {
		this.lastStyleguidePath = lastStyleguidePath;
	}

	/**
	 * Serializes the preferences into a JSON object for persistence.
	 * @return The JSON object to be persisted.
	 */
	public toJsonObject(): JsonObject {
		return {
			lastStyleguidePath: this.getLastStyleguidePath(),
			lastPageId: this.getLastPageId()
		};
	}
}
