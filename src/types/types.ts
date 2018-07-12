import * as PatternProperty from './pattern-property';
import * as UserStore from './user-store';

export enum AppState {
	Starting = 'starting',
	Started = 'started'
}

export type SerializedAppState = 'starting' | 'started';

export interface SavedProject {
	elementActions: SerializedElementAction[];
	elementContents: SerializedElementContent[];
	elements: SerializedElement[];
	id: string;
	name: string;
	pages: SerializedPage[];
	patternLibraries: SerializedPatternLibrary[];
	userStore: UserStore.SerializedUserStore;
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
	focused: boolean;
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
	forcedOpen: boolean;
	highlighted: boolean;
	id: string;
	open: boolean;
	parentElementId?: string;
	slotId: string;
}

export enum PatternLibraryState {
	Pristine = 'pristine',
	Connected = 'connected',
	Disconnected = 'disconnected'
}

export interface SerializedPatternLibrary {
	bundleId: string;
	bundle: string;
	description: string;
	id: string;
	name: string;
	origin: SerializedPatternLibraryOrigin;
	patternProperties: PatternProperty.SerializedPatternProperty[];
	patterns: SerializedPattern[];
	state: PatternLibraryState;
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
	description: string;
	example: string;
	hidden: boolean;
	id: string;
	label: string;
	propertyName: string;
	required: boolean;
	type: string;
}

export enum AlvaView {
	PageDetail = 'PageDetail',
	SplashScreen = 'SplashScreen'
}

export type SerializedAlvaView = 'PageDetail' | 'SplashScreen';

export enum EditableTitleState {
	Editable = 'Editable',
	Editing = 'Editing'
}

export enum EditableTitleType {
	Primary,
	Secondary
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

export type LibraryAnalysisResult = LibraryAnalysisSuccess | LibraryAnalysisError;

export enum LibraryAnalysisResultType {
	Success,
	Error
}

export interface LibraryAnalysis {
	bundle: string;
	description: string;
	id: string;
	name: string;
	path: string;
	patterns: PatternAnalysis[];
	version: string;
}

export interface LibraryAnalysisSuccess {
	type: LibraryAnalysisResultType.Success;
	result: LibraryAnalysis;
}

export interface LibraryAnalysisError {
	type: LibraryAnalysisResultType.Error;
	error: Error;
}

export interface PatternAnalysis {
	path: string;
	pattern: SerializedPattern;
	properties: PatternProperty.SerializedPatternProperty[];
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
	elementActions: SerializedElementAction[];
	elementContents: SerializedElementContent[];
	elements: SerializedElement[];
	pageId: string;
	pages: SerializedPage[];
	userStore: UserStore.SerializedUserStore;
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
	description: string;
	id: string;
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
	path: string | undefined;
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
	mode: 'static' | 'live' | 'live-mirror';
	elements: SerializedElement[];
	highlightedElementId?: string;
	pageId: string;
	pages: SerializedPage[];
	selectedElementId?: string;
}

export interface PatternIdPayload {
	id: string;
}

export enum ElementRole {
	Root = 'root',
	Node = 'node'
}

export interface SerializedAlvaApp {
	activeView: SerializedAlvaView;
	panes: SerializedAppPane[];
	rightSidebarTab: SerializedRightSidebarTab;
	searchTerm: string;
	state: SerializedAppState;
}

export interface EditHistoryItem {
	app: SerializedAlvaApp;
	project: SerializedProject;
}

export type ElementPropertyValue =
	| undefined
	| boolean
	| number
	| number[]
	| object
	| string
	| string[];

export interface SerializedElementAction {
	id: string;
	payload: string;
	storeActionId: string;
	storePropertyId: string;
}

export enum RightSidebarTab {
	Properties = 'properties',
	ProjectSettings = 'project-settings'
}

export type SerializedRightSidebarTab = 'properties' | 'project-settings';

export interface SerializedPatternLibraryFile {
	content: Buffer;
	id: string;
	relativePath: string;
}

export enum PatternLibraryOrigin {
	BuiltIn = 'built-in',
	UserProvided = 'user-provided'
}

export type SerializedPatternLibraryOrigin = 'built-in' | 'user-provided';

export enum ProjectStatus {
	None = 'none',
	Ok = 'ok',
	Error = 'error'
}

export enum PreviewDocumentMode {
	Live = 'live',
	LiveMirror = 'live-mirror',
	Static = 'static'
}

export enum ContextMenuType {
	LayoutMenu = 'layout-menu',
	ElementMenu = 'element-menu'
}

export type ContextMenuRequestPayload = ElementContextMenuRequest | LayoutContextMenuRequest;

export interface ElementContextMenuRequest {
	menu: ContextMenuType.ElementMenu;
	data: ElementContextMenuRequestPayload;
}

export interface ElementContextMenuRequestPayload {
	element: SerializedElement;
	clipboardItem: SerializedElement | undefined;
	project: SerializedProject;
}

export interface LayoutContextMenuRequest {
	menu: ContextMenuType.LayoutMenu;
	data: LayoutContextMenuRequestPayload;
}

export interface LayoutContextMenuRequestPayload {
	app: SerializedAlvaApp;
}

export enum AppPane {
	PagesPane = 'pages-pane',
	ElementsPane = 'elements-pane',
	PropertiesPane = 'properties-pane'
}

export type SerializedAppPane = 'pages-pane' | 'elements-pane' | 'properties-pane';

export interface MainMenuContext {
	app: SerializedAlvaApp;
	project?: SerializedProject;
}

export enum FocusedItemType {
	Page,
	Element
}

export enum HoverArea {
	Chrome,
	Preview
}

export enum LibraryCapability {
	Disconnect,
	Update,
	Reconnect,
	SetPath
}
