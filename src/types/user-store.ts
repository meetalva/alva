export enum UserStorePropertyType {
	String = 'string',
	Page = 'page'
}

export enum UserStoreActionType {
	Noop = 'noop',
	OpenExternal = 'open-external',
	Set = 'set',
	SetPage = 'set-page'
}

export type SerializedUserStorePropertyType = 'string' | 'page';

export type SerializedUserStoreActionType = 'noop' | 'set' | 'set-page' | 'open-external';

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

export interface UserStoreEnhancerModule {
	onStoreCreate(store: DesignTimeUserStore): DesignTimeUserStore;
	onStoreUpdate(store: RuntimeUserStore): RuntimeUserStore;
}

export interface DesignTimeUserStore {
	getProperties(): DesignTimeProperty[];
	getProperty(name: string): DesignTimeProperty | undefined;
	addProperty(name: string, value?: string): DesignTimeProperty;
	removeProperty(prop: string | DesignTimeProperty): void;
}

export interface DesignTimeProperty {
	setName(name: string): void;
	getName(): string;
	getValue(): string | undefined;
	setValue(value: string): void;
}

export interface RuntimeUserStore {
	getProperties(): RuntimeProperty[];
	getProperty(name: string): RuntimeProperty | undefined;
}

export interface RuntimeProperty {
	getName(): string;
	getValue(): string | undefined;
	setValue(value: string): void;
}
