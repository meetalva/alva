import * as PatternProperty from './pattern-property';
import * as SerializedModel from './serialized-model';
import * as UserStore from './user-store';
import * as Ts from 'typescript';

export enum AppState {
	Starting = 'starting',
	Started = 'started'
}

export enum PatternType {
	Pattern = 'pattern',
	SyntheticBox = 'synthetic:box',
	SyntheticConditional = 'synthetic:conditional',
	SyntheticImage = 'synthetic:image',
	SyntheticLink = 'synthetic:link',
	SyntheticPage = 'synthetic:page',
	SyntheticText = 'synthetic:text'
}

export enum AlvaView {
	PageDetail = 'PageDetail',
	SplashScreen = 'SplashScreen'
}

export enum ProjectViewMode {
	Design = 'Design',
	Libraries = 'Libraries'
}

export enum EditableTitleState {
	Neutral = 'Neutral',
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

export interface RenderPage {
	id: string;
	name: string;
}

export type LibraryAnalysisResult = LibraryAnalysisSuccess | LibraryAnalysisError;

export enum LibraryAnalysisResultType {
	Success = 'LibraryAnalysisSuccess',
	Error = 'LibraryAnalysisError'
}

export interface LibraryAnalysis {
	bundle: string;
	color: string;
	description: string;
	displayName: string;
	homepage: string;
	id: string;
	image: string;
	name: string;
	packageFile: { [key: string]: unknown };
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

export interface PropertyAnalysis {
	property: PatternProperty.SerializedPatternProperty;
	symbol: Ts.Symbol;
}

export interface InternalPatternAnalysis {
	path: string;
	pattern: SerializedModel.SerializedPattern;
	properties: PropertyAnalysis[];
	symbol: Ts.Symbol;
}

export interface PatternAnalysis {
	path: string;
	pattern: SerializedModel.SerializedPattern;
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
	elementActions: SerializedModel.SerializedElementAction[];
	elementContents: SerializedModel.SerializedElementContent[];
	elements: SerializedModel.SerializedElement[];
	pageId: string;
	pages: SerializedModel.SerializedPage[];
	userStore: UserStore.SerializedUserStore;
}

export enum ProjectPayloadStatus {
	Ok,
	Error
}

export type ProjectPayload = ProjectPayloadError | ProjectPayloadSuccess;

export interface ProjectPayloadError {
	error: Error;
	status: ProjectPayloadStatus;
}

export interface ProjectPayloadSuccess {
	contents: SerializedModel.SerializedProject;
	path: string;
	status: ProjectPayloadStatus;
}

export interface SavePayload {
	path: string;
	project: SerializedModel.SerializedProject;
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
	patterns: InternalPatternAnalysis[];
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
	elements: SerializedModel.SerializedElement[];
	highlightedElementId?: string;
	pageId: string;
	pages: SerializedModel.SerializedPage[];
	selectedElementId?: string;
}

export interface PatternIdPayload {
	id: string;
}

export enum ElementRole {
	Root = 'root',
	Node = 'node'
}

export interface PaneSize {
	pane: AppPane;
	width?: number;
	height?: number;
}

export type ElementPropertyValue =
	| undefined
	| boolean
	| number
	| number[]
	| object
	| string
	| string[]
	| unknown;

export interface SerializedPatternLibraryFile {
	content: Buffer;
	id: string;
	relativePath: string;
}

export enum PatternLibraryOrigin {
	Unknown = 'unknown',
	BuiltIn = 'built-in',
	UserProvided = 'user-provided'
}

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
	ElementMenu = 'element-menu'
}

export type ContextMenuRequestPayload = ElementContextMenuRequest;

export interface ElementContextMenuRequest {
	menu: ContextMenuType.ElementMenu;
	projectId: string;
	data: ElementContextMenuRequestPayload;
	position: {
		x: number;
		y: number;
	};
}

export interface ElementContextMenuRequestPayload {
	element: SerializedModel.SerializedElement;
}

export interface LayoutContextMenuRequestPayload {
	app: SerializedModel.SerializedAlvaApp;
}

export enum AppPane {
	PagesPane = 'pages-pane',
	PatternsPane = 'patterns-pane',
	ElementsPane = 'elements-pane',
	PropertiesPane = 'properties-pane',
	DevelopmentPane = 'development-pane'
}

export enum ItemType {
	None = 'none',
	Page = 'page',
	Element = 'element'
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

export enum ElementTargetType {
	Auto = 'auto',
	Below = 'below',
	Inside = 'inside'
}

export interface Point {
	x: number;
	y: number;
}

export interface Identifiable {
	getId(): string;
}

export enum ElementActionPayloadType {
	String = 'string',
	EventPayload = 'event-payload',
	PropertyPayload = 'property-payload'
}

export enum ModelName {
	AlvaApp = 'AlvaApp',
	Element = 'Element',
	ElementAction = 'ElementAction',
	ElementActionPayload = 'ElementActionPayload',
	ElementContent = 'ElementContent',
	ElementProperty = 'ElementProperty',
	Page = 'Page',
	Pattern = 'Pattern',
	PatternEnumPropertyOption = 'PatternEnumPropertyOption',
	PatternLibrary = 'PatternLibrary',
	PatternProperty = 'PatternProperty',
	PatternSlot = 'PatternSlot',
	Project = 'Project',
	UserStore = 'UserStore',
	UserStoreAction = 'UserStoreAction',
	UserStoreEnhancer = 'UserStoreEnhancer',
	UserStoreProperty = 'UserStoreProperty',
	UserStoreReference = 'UserStoreReference'
}

declare class ModelSurface {
	public from<V>(data: unknown, context?: unknown): unknown;
}

export { ModelSurface };

export enum ActionName {
	MatchHighlightedElement = 'MatchHighlightedElement',
	OpenFile = 'OpenFile'
}

export interface Dependencies {
	patterns: PatternDependency[];
	libraries: LibraryDependency[];
}

export interface LibraryDependency {
	id: string;
	bundleId: string;
	bundleHash: string;
	origin: SerializedModel.SerializedPatternLibraryOrigin;
}

export interface PatternDependency {
	id: string;
	contextId: string;
	libraryId: string;
	type: SerializedModel.SerializedPatternType;
}

export enum PreviewTransferType {
	Inline = 'inline',
	Message = 'message'
}

export interface Location {
	readonly hash: string;
	readonly host: string;
	readonly hostname: string;
	readonly href: string;
	readonly origin: string;
	readonly pathname: string;
	readonly port: string;
	readonly protocol: string;
	readonly search: string;
}
