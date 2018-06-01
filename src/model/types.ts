export enum AppState {
	Starting = 'starting',
	Started = 'started'
}

export type SerializedAppState = 'starting' | 'started';

export interface SavedProject {
	elementContents: SerializedElementContent[];
	elements: SerializedElement[];
	id: string;
	name: string;
	pages: SerializedPage[];
	patternLibrary: SerializedPatternLibrary;
}

export interface SerializedProject extends SavedProject {
	path: string;
}

export interface SerializedPage {
	active: boolean;
	id: string;
	name: string;
	rootId: string;
}

export type SerializedElementRole = 'root' | 'node';

export interface SerializedElement {
	containerId?: string;
	contentIds: string[];
	dragged: boolean;
	forcedOpen: boolean;
	highlighted: boolean;
	id: string;
	name: string;
	open: boolean;
	patternId: string;
	placeholderHighlighted: boolean;
	properties: SerializedElementProperty[];
	role: SerializedElementRole;
	selected: boolean;
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

export enum PatternType {
	Pattern = 'pattern',
	SyntheticBox = 'synthetic:box',
	SyntheticImage = 'synthetic:image',
	SyntheticLink = 'synthetic:link',
	SyntheticPage = 'synthetic:page',
	SyntheticText = 'synthetic:text'
}

export type SerializedPatternType =
	| 'pattern'
	| 'synthetic:box'
	| 'synthetic:image'
	| 'synthetic:link'
	| 'synthetic:page'
	| 'synthetic:text';

export enum PatternOrigin {
	BuiltIn = 'built-in',
	UserProvided = 'user-provided'
}

export type SerializedPatternOrigin = 'built-in' | 'user-provided';

export interface SerializedPattern {
	contextId: string;
	description: string;
	exportName: string;
	id: string;
	name: string;
	origin: SerializedPatternOrigin;
	propertyIds: string[];
	slots: SerializedPatternSlot[];
	type: SerializedPatternType;
}

export interface SerializedPatternSlot {
	contextId: string;
	displayName: string;
	id: string;
	propertyName: string;
	type: string;
}

export enum PatternPropertyType {
	Asset = 'asset',
	Boolean = 'boolean',
	Enum = 'enum',
	Href = 'href',
	NumberArray = 'number[]',
	Number = 'number',
	StringArray = 'string[]',
	String = 'string'
}

export type SerializedPatternPropertyType =
	| 'asset'
	| 'boolean'
	| 'enum'
	| 'href'
	| 'number[]'
	| 'number'
	| 'string[]'
	| 'string';

export enum PatternPropertyOrigin {
	BuiltIn = 'built-in',
	UserProvided = 'user-provided'
}

export type SerializedPatternPropertyOrigin = 'built-in' | 'user-provided';

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
	| SerializedStringProperty
	| SerializedHrefProperty;

export interface SerializedPropertyBase {
	contextId: string;
	description: string;
	example: string;
	hidden: boolean;
	id: string;
	label: string;
	origin: SerializedPatternPropertyOrigin;
	propertyName: string;
	required: boolean;
	type: SerializedPatternPropertyType;
}

export interface SerializedPatternAssetProperty extends SerializedPropertyBase {
	defaultValue?: string;
	type: 'asset';
}

export interface SerializedPatternBooleanProperty extends SerializedPropertyBase {
	defaultValue?: boolean;
	type: 'boolean';
}

export interface SerializedPatternEnumProperty extends SerializedPropertyBase {
	defaultOptionId?: string;
	options: SerializedEnumOption[];
	type: 'enum';
}

export interface SerializedEnumOption {
	contextId: string;
	id: string;
	name: string;
	ordinal: number;
	value: string | number;
}

export interface SerializedPatternNumberArrayProperty extends SerializedPropertyBase {
	defaultValue: number[];
	type: 'number[]';
}

export interface SerializedPatternNumberProperty extends SerializedPropertyBase {
	defaultValue?: number;
	type: 'number';
}

export interface SerializedPatternStringArrayProperty extends SerializedPropertyBase {
	defaultValue: string[];
	type: 'string[]';
}

export interface SerializedStringProperty extends SerializedPropertyBase {
	defaultValue?: string;
	type: 'string';
}

export interface SerializedHrefProperty extends SerializedPropertyBase {
	defaultValue?: string;
	type: 'href';
}

export enum AlvaView {
	Pages = 'Pages',
	PageDetail = 'PageDetail',
	SplashScreen = 'SplashScreen'
}

export type SerializedAlvaView = 'Pages' | 'PageDetail' | 'SplashScreen';

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

export interface PageChangePayload {
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

export interface Renderer {
	render(init: RenderInit, container: HTMLElement): void;
}

export interface RenderSelectArea {
	bottom: number;
	height: number;
	isVisible: boolean;
	left: number;
	node: Element;
	opacity: number;
	right: number;
	top: number;
	width: number;
	hide(): void;
	setSize(element: Element): void | Element;
	show(): void;
	update(): void;
}

export interface RenderPreviewStore {
	elements: SerializedElement[];
	highlightedElementId?: string;
	pageId: string;
	pages: SerializedPage[];
	selectedElementId?: string;
}

export interface RenderInit {
	store: RenderPreviewStore;
	// tslint:disable-next-line:no-any
	getChildren(props: any, render: (props: any) => any): any;
	// tslint:disable-next-line:no-any
	getComponent(props: any, synthetics: any): React.Component | React.SFC | undefined;
	// tslint:disable-next-line:no-any
	getProperties(props: any): any;
	// tslint:disable-next-line:no-any
	getSlots(slots: any, render: (props: any) => any): any;
	onElementClick(e: MouseEvent, payload: { id: string }): void;
	onElementMouseOver(e: MouseEvent, payload: { id: string | undefined }): void;
	onElementSelect(e: MouseEvent, payload: { id: string }): void;
	onOutsideClick(e: MouseEvent): void;
}

export interface PatternIdPayload {
	id: string;
	metaDown: boolean;
}

export enum ElementRole {
	Root = 'root',
	Node = 'node'
}

export interface SerializedAlvaApp {
	activeView: SerializedAlvaView;
	searchTerm: string;
	state: SerializedAppState;
}

export interface EditHistoryItem {
	app: SerializedAlvaApp;
	project: SerializedProject;
}
