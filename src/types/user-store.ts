export enum UserStorePropertyValueType {
	String = 'string',
	Page = 'page'
}

export enum UserStoreActionType {
	Noop = 'noop',
	OpenExternal = 'open-external',
	Set = 'set',
	SetPage = 'set-page'
}

export type SerializedUserStorePropertyValueType = 'string' | 'page';

export type SerializedUserStorePropertyType = 'concrete' | 'computed';

export type SerializedUserStoreActionType = 'noop' | 'set' | 'set-page' | 'open-external';

export interface SerializedUserStoreProperty {
	id: string;
	name: string;
	concreteValue: string | undefined;
	initialValue: string;
	type: SerializedUserStorePropertyType;
	valueType: SerializedUserStorePropertyValueType;
}

export enum UserStorePropertyType {
	Concrete = 'concrete',
	Computed = 'computed'
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
	currentPageProperty: SerializedUserStoreProperty;
	enhancer: SerializedUserStoreEnhancer;
	id: string;
	properties: SerializedUserStoreProperty[];
	references: SerializedUserStoreReference[];
}

export type UserStoreActionPayload = string;

export interface SerializedUserStoreReference {
	id: string;
	open: boolean;
	elementPropertyId: string;
	userStorePropertyId: string | undefined;
}

export interface SerializedUserStoreEnhancer {
	id: string;
	code: string;
}
