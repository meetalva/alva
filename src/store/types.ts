export interface SerializedProject {
	lastChangedAuthor: string;
	lastChangedDate?: string;
	name: string;
	pages: SerializedPage[];
	styleguide: SerializedStyleguide;
	uuid: string;
}

export interface SerializedPage {
	id: string;
	name: string;
	root: SerializedPageElement;
}

export interface SerializedPageElement {
	id: string;
	name: string;
	pattern: string;
}

export interface SerializedStyleguide {
	id: string;
	patterns: SerializedPattern[];
}

export interface SerializedPattern {
	exportName: string;
	id: string;
	name: string;
	path: string;
	properties: SerializedProperty[];
	slots: SerializedPatternSlot[];
	type: string;
}

export interface SerializedPatternSlot {
	id: string;
	name: string;
}

export enum PropertyType {
	Asset = 'asset',
	Boolean = 'boolean',
	Enum = 'enum',
	NumberArray = 'number[]',
	Number = 'number',
	Object = 'object',
	StringArray = 'string[]',
	String = 'string'
}

export type SerializedProperty =
	| SerializedAssetProperty
	| SerializedBooleanProperty
	| SerializedEnumProperty
	| SerializedNumberArrayProperty
	| SerializedNumberProperty
	| SerializedObjectProperty
	| SerializedStringArrayProperty
	| SerializedStringProperty;

export interface SerializedAssetProperty {
	defaultValue: string;
	hidden: boolean;
	id: string;
	name: string;
	required: boolean;
	type: PropertyType.Asset;
}

export interface SerializedBooleanProperty {
	defaultValue: boolean;
	hidden: boolean;
	id: string;
	name: string;
	required: boolean;
	type: PropertyType.Boolean;
}

export interface SerializedEnumProperty {
	defaultValue: boolean;
	hidden: boolean;
	id: string;
	name: string;
	options: SerializedEnumOption[];
	required: boolean;
	type: PropertyType.Enum;
}

export interface SerializedEnumOption {
	id: string;
	name: string;
	ordinal: number;
}

export interface SerializedNumberArrayProperty {
	defaultValue: number[];
	hidden: boolean;
	id: string;
	name: string;
	required: boolean;
	type: PropertyType.NumberArray;
}

export interface SerializedNumberProperty {
	defaultValue: number;
	hidden: boolean;
	id: string;
	name: string;
	required: boolean;
	type: PropertyType.Number;
}

export interface SerializedObjectProperty {
	defaultValue: number;
	hidden: boolean;
	id: string;
	name: string;
	required: boolean;
	type: PropertyType.Object;
}

export interface SerializedStringArrayProperty {
	defaultValue: string[];
	hidden: boolean;
	id: string;
	name: string;
	required: boolean;
	type: PropertyType.StringArray;
}

export interface SerializedStringProperty {
	defaultValue: string;
	hidden: boolean;
	id: string;
	name: string;
	required: boolean;
	type: PropertyType.String;
}
