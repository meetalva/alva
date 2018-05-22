export enum AppState {
	Starting = 'starting',
	Started = 'started'
}

export interface SavedProject {
	elementContents: SerializedElementContent[];
	elements: SerializedElement[];
	id: string;
	lastChangedAuthor: string;
	lastChangedDate?: string;
	name: string;
	pages: SerializedPage[];
	patternLibrary: SerializedPatternLibrary;
}

export interface SerializedProject extends SavedProject {
	path: string;
}

export interface SerializedPage {
	id: string;
	name: string;
	rootId: string;
}

export interface SerializedElement {
	containerId?: string;
	contentIds: string[];
	id: string;
	name: string;
	patternId: string;
	properties: SerializedElementProperty[];
}

export interface SerializedElementContent {
	elementIds: string[];
	id: string;
	name: string;
	parentElementId?: string;
	slotId: string;
}

export enum PatternLibraryState {
	Pristine = 'pristine',
	Connected = 'connected',
	Disconnected = 'disconnected'
}

export interface SerializedPatternLibrary {
	bundle: string;
	id: string;
	patternProperties: SerializedPatternProperty[];
	patterns: SerializedPattern[];
	root: SerializedPatternFolder;
	state: PatternLibraryState;
}

export interface SerializedPatternFolder {
	children: SerializedPatternFolder[];
	id: string;
	name: string;
	patterns: string[];
	type: 'builtin' | 'user-provided';
}

export enum SerializedPatternType {
	Pattern = 'pattern',
	Synthetic = 'synthetic'
}

export interface SerializedPattern {
	contextId: string;
	exportName: string;
	id: string;
	name: string;
	propertyIds: string[];
	slots: SerializedPatternSlot[];
	type: SerializedPatternType | string;
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
	defaultValue?: string;
	type: PatternPropertyType.Asset;
}

export interface SerializedPatternBooleanProperty extends SerializedPropertyBase {
	defaultValue?: boolean;
	type: PatternPropertyType.Boolean;
}

export interface SerializedPatternEnumProperty extends SerializedPropertyBase {
	defaultOptionId?: string;
	options: SerializedEnumOption[];
	type: PatternPropertyType.Enum;
}

export interface SerializedEnumOption {
	id: string;
	name: string;
	ordinal: number;
	value: string | number;
}

export interface SerializedPatternNumberArrayProperty extends SerializedPropertyBase {
	defaultValue: number[];
	type: PatternPropertyType.NumberArray;
}

export interface SerializedPatternNumberProperty extends SerializedPropertyBase {
	defaultValue?: number;
	type: PatternPropertyType.Number;
}

export interface SerializedPatternStringArrayProperty extends SerializedPropertyBase {
	defaultValue: string[];
	type: PatternPropertyType.StringArray;
}

export interface SerializedStringProperty extends SerializedPropertyBase {
	defaultValue?: string;
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
	patternPropertyId: string;
	setDefault: boolean;
	value: ElementPropertyValue;
}

export interface RenderPage {
	id: string;
	name: string;
}

export interface LibraryAnalysis {
	bundle: string;
	name: string;
	path: string;
	patterns: PatternAnalysis[];
	version: string;
}

export interface PatternAnalysis {
	path: string;
	pattern: SerializedPattern;
	properties: SerializedPatternProperty[];
}

export interface ExportWriteResult {
	error?: Error;
}

export interface Exporter {
	contents: Buffer;
	execute(path: string): void;
}

export interface FilePayload {
	contents: Buffer;
	name: string;
	path: string;
}

export interface PageChangePaylod {
	elementContents: SerializedElementContent[];
	elements: SerializedElement[];
	pageId: string;
	pages: SerializedPage[];
}

export interface ProjectPayload {
	contents: SerializedProject;
	path: string;
}

export interface SavePayload {
	path: string;
	project: SerializedProject;
}

export interface SketchExportPayload {
	artboardName: string;
	pageName: string;
}

export interface ExportPayload {
	content: Buffer;
	path: string;
}

export interface ImportPayload {
	bundle: string;
	name: string;
	path: string;
	patterns: PatternAnalysis[];
	version: string;
}

export interface LibraryNotificationPayload {
	id: string;
	path: string;
}

export interface LibraryCheckPayload {
	connected: boolean;
	id: string;
	path: string;
}

export enum PatternFolderType {
	Builtin = 'builtin',
	UserProvided = 'user-provided'
}

export interface Watcher {
	getPath(): string;
	isActive(): boolean;
	stop(): void;
}
