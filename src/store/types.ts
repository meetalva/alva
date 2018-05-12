export enum AppState {
	Starting = 'starting',
	Started = 'started'
}

export interface SavedProject {
	lastChangedAuthor: string;
	lastChangedDate?: string;
	name: string;
	pages: SerializedPage[];
	styleguide: SerializedStyleguide;
	uuid: string;
}

export interface SerializedProject extends SavedProject {
	path: string;
}

export interface SerializedPage {
	id: string;
	name: string;
	root: SerializedElement;
}

export interface SerializedElement {
	contents: SerializedPageElementContent[];
	id: string;
	name: string;
	pattern: string;
	properties: SerializedElementProperty[];
}

export interface SerializedPageElementContent {
	elements: SerializedElement[];
	id: string;
	name: string;
	slotId: string;
	slotType: string;
}

export interface SerializedStyleguide {
	id: string;
	patterns: SerializedPattern[];
	root: SerializedPatternFolder;
}

export interface SerializedPatternFolder {
	children: SerializedPatternFolder[];
	id: string;
	name: string;
	patterns: string[];
}

export interface SerializedPattern {
	exportName: string;
	id: string;
	name: string;
	path: string;
	properties: SerializedPatternProperty[];
	slots: SerializedPatternSlot[];
	type: string;
}

export interface SerializedPatternSlot {
	displayName: string;
	id: string;
	propertyName: string;
	type: string;
}

export enum PatternPropertyType {
	Asset = 'asset',
	Boolean = 'boolean',
	Enum = 'enum',
	NumberArray = 'number[]',
	Number = 'number',
	Object = 'object',
	StringArray = 'string[]',
	String = 'string'
}

export type ElementPropertyValue =
	| undefined
	| boolean
	| number
	| number[]
	| object
	| string
	| string[];

export type SerializedPatternProperty =
	| SerializedPatternAssetProperty
	| SerializedPatternBooleanProperty
	| SerializedPatternEnumProperty
	| SerializedPatternNumberArrayProperty
	| SerializedPatternNumberProperty
	| SerializedPatternObjectProperty
	| SerializedPatternStringArrayProperty
	| SerializedStringProperty;

export interface SerializedPropertyBase {
	hidden: boolean;
	id: string;
	label: string;
	propertyName: string;
	required: boolean;
}

export interface SerializedPatternAssetProperty extends SerializedPropertyBase {
	defaultValue: string;
	type: PatternPropertyType.Asset;
}

export interface SerializedPatternBooleanProperty extends SerializedPropertyBase {
	defaultValue: boolean;
	type: PatternPropertyType.Boolean;
}

export interface SerializedPatternEnumProperty extends SerializedPropertyBase {
	defaultValue: boolean;
	options: SerializedEnumOption[];
	type: PatternPropertyType.Enum;
}

export interface SerializedEnumOption {
	id: string;
	name: string;
	ordinal: number;
}

export interface SerializedPatternNumberArrayProperty extends SerializedPropertyBase {
	defaultValue: number[];
	type: PatternPropertyType.NumberArray;
}

export interface SerializedPatternNumberProperty extends SerializedPropertyBase {
	defaultValue: number;
	type: PatternPropertyType.Number;
}

export interface SerializedPatternObjectProperty extends SerializedPropertyBase {
	defaultValue: number;
	type: PatternPropertyType.Object;
}

export interface SerializedPatternStringArrayProperty extends SerializedPropertyBase {
	defaultValue: string[];
	type: PatternPropertyType.StringArray;
}

export interface SerializedStringProperty extends SerializedPropertyBase {
	defaultValue: string;
	type: PatternPropertyType.String;
}

export enum AlvaView {
	Pages = 'Pages',
	PageDetail = 'PageDetail',
	SplashScreen = 'SplashScreen'
}

export enum RightPane {
	Patterns = 'Patterns',
	Properties = 'Properties'
}

export enum EditState {
	Editable = 'Editable',
	Editing = 'Editing'
}

export enum SlotType {
	Children = 'children',
	Property = 'property'
}

export interface SerializedElementProperty {
	id: string;
	patternProperty: SerializedPatternProperty;
	setDefault: boolean;
	value: ElementPropertyValue;
}

export interface RenderPage {
	id: string;
	name: string;
}
