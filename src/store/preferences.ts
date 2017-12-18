import { JsonObject } from './json';
import * as MobX from 'mobx';

export class Preferences {
	@MobX.observable private lastStyleguidePath?: string;
	@MobX.observable private lastPageId?: string;

	public static fromJsonObject(jsonObject: JsonObject): Preferences {
		const preferences: Preferences = new Preferences();
		preferences.lastStyleguidePath = jsonObject.lastStyleguidePath as string;
		preferences.lastPageId = jsonObject.lastPageId as string;
		return preferences;
	}

	public getLastStyleguidePath(): string | undefined {
		return this.lastStyleguidePath;
	}

	public getLastPageId(): string | undefined {
		return this.lastPageId;
	}

	public setLastStyleguidePath(lastStyleguidePath?: string): void {
		this.lastStyleguidePath = lastStyleguidePath;
	}

	public setLastPageId(lastPageId?: string): void {
		this.lastPageId = lastPageId;
	}

	public toJsonObject(): JsonObject {
		return {
			lastStyleguidePath: this.getLastStyleguidePath(),
			lastPageId: this.getLastPageId()
		};
	}
}
