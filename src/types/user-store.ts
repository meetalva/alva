export enum UserStorePropertyType {
	String = 'string',
	Page = 'page'
}

export enum UserStoreActionType {
	Noop = 'noop',
	Set = 'set'
}

export type SerializedUserStorePropertyType = 'string' | 'page';

export type SerializedUserStoreActionType = 'noop' | 'set';

export interface SerializedUserStoreProperty {
	id: string;
	name: string;
	payload: string;
	type: SerializedUserStorePropertyType;
}

export interface SerializedUserStoreAction {
	acceptsProperty: boolean;
	id: string;
	name: string;
	storePropertyId?: string;
	type: SerializedUserStoreActionType;
}

export interface SerializedUserStore {
	actions: SerializedUserStoreAction[];
	id: string;
	properties: SerializedUserStoreProperty[];
}
