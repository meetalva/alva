import * as PatternProperty from './pattern-property';
import * as Types from './types';
import * as UserStore from './user-store';

export enum PatternLibraryInstallType {
	Remote = 'remote',
	Local = 'local'
}

export enum PatternLibraryState {
	Pristine = 'pristine',
	Connecting = 'connecting',
	Connected = 'connected',
	Disconnected = 'disconnected'
}

export type SerializedAppPane =
	| 'pages-pane'
	| 'patterns-pane'
	| 'elements-pane'
	| 'properties-pane'
	| 'development-pane';

export type SerializedAlvaView = 'PageDetail' | 'SplashScreen';

export type SerializedPatternType =
	| 'pattern'
	| 'synthetic:box'
	| 'synthetic:conditional'
	| 'synthetic:image'
	| 'synthetic:link'
	| 'synthetic:page'
	| 'synthetic:text';

export type SerializedPatternLibraryOrigin = 'built-in' | 'user-provided';

export type SerializedAppState = 'starting' | 'started';

export type SerializedElementRole = 'root' | 'node';

export type SerializedItemType = 'none' | 'page' | 'element';

export type SerializedItem = SerializedPage | SerializedElement;

export type SerializedRightSidebarTab = 'properties' | 'project-settings';

export interface SerializedPaneSize {
	pane: SerializedAppPane;
	width?: number;
	height?: number;
}

export interface SerializedPattern {
	model: Types.ModelName.Pattern;
	contextId: string;
	description: string;
	exportName: string;
	group: string;
	id: string;
	icon: string;
	name: string;
	propertyIds: string[];
	slots: SerializedPatternSlot[];
	type: SerializedPatternType;
}

export interface ElementProp {
	propName: string;
	value: any;
}

export interface ElementCandidate {
	parent: string;
	patternContextId: string;
	libraryId: string;
	id: string;
	props: ElementProp[];
	jsxFragment: boolean;
	children: ElementCandidate[];
}

export interface SerializedPatternSlot {
	model: Types.ModelName.PatternSlot;
	contextId: string;
	description: string;
	defaultValue: ElementCandidate | undefined;
	example: string;
	hidden: boolean;
	id: string;
	label: string;
	propertyName: string;
	required: boolean;
	type: string;
}

export type SerializedPatternLibrary = SerializedPatternLibraryV2;

export interface SerializedPatternLibraryV1 {
	bundle: string;
	bundleId: string;
	description?: string;
	id: string;
	installType: PatternLibraryInstallType;
	model: Types.ModelName.PatternLibrary;
	name: string;
	origin: SerializedPatternLibraryOrigin;
	patterns: SerializedPattern[];
	patternProperties: PatternProperty.SerializedPatternProperty[];
	state: PatternLibraryState;
	version: string;
}

export interface SerializedPatternLibraryV2 {
	builtin?: boolean;
	bundle: string;
	bundleId: string;
	id: string;
	installType: PatternLibraryInstallType;
	model: Types.ModelName.PatternLibrary;
	origin: SerializedPatternLibraryOrigin;
	packageFile: {
		name: string;
		version: string;
		[key: string]: unknown;
	};
	patterns: SerializedPattern[];
	patternProperties: PatternProperty.SerializedPatternProperty[];
	state: PatternLibraryState;
}

export type SavedProject = VersionThreeSerializedProject;

export type MigratableProject =
	| VersionZeroSerializedProject
	| VersionOneSerializedProject
	| VersionTwoSerializedProject
	| VersionThreeSerializedProject;

export interface VersionZeroSerializedProject {
	version?: number;
	model: Types.ModelName.Project;
	elementActions: SerializedElementAction[];
	elementContents: SerializedElementContent[];
	elements: SerializedElement[];
	id: string;
	name: string;
	pages: SerializedPage[];
	pageList: string[];
	patternLibraries: SerializedPatternLibraryV1[];
	userStore: UserStore.SerializedUserStore;
}

export interface VersionOneSerializedProject {
	version: number;
	model: Types.ModelName.Project;
	elementActions: SerializedElementAction[];
	elementContents: SerializedElementContent[];
	elements: SerializedElement[];
	id: string;
	name: string;
	pages: SerializedPage[];
	pageList: string[];
	patternLibraries: SerializedPatternLibraryV1[];
	userStore: UserStore.SerializedUserStore;
}

export interface VersionTwoSerializedProject {
	version: number;
	model: Types.ModelName.Project;
	elementActions: SerializedElementAction[];
	elementContents: SerializedElementContent[];
	elements: SerializedElement[];
	id: string;
	name: string;
	pages: SerializedPage[];
	pageList: string[];
	patternLibraries: SerializedPatternLibraryV2[];
	userStore: UserStore.SerializedUserStore;
}

export type VersionThreeSerializedProject = VersionTwoSerializedProject;

export interface SerializedProject extends SavedProject {
	draft: boolean;
	path: string;
}

export interface SerializedPage {
	model: Types.ModelName.Page;
	active: boolean;
	focused: boolean;
	id: string;
	name: string;
	rootId: string;
}

export interface SerializedElement {
	model: Types.ModelName.Element;
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
	placeholderHighlighted: 'before' | 'after' | 'none';
	propertyValues: [string, Types.ElementPropertyValue][];
	/** @deprecated
	 * Formerly direct serialization of ElementProperty,
	 * which are derived from propertyValues + patternProperties now.
	 * Kept around for backward compat
	 * */
	properties?: [];
	role: SerializedElementRole;
	selected: boolean;
}

export interface SerializedElementValue {
	id: string;
	value: Types.ElementPropertyValue;
}

export interface SerializedElementContent {
	model: Types.ModelName.ElementContent;
	elementIds: string[];
	forcedOpen: boolean;
	highlighted: boolean;
	id: string;
	open: boolean;
	parentElementId?: string;
	slotId: string;
}

/**
 * @deprecated
 * Element properties are now derived from patternProperties + element.propertyValues
 */
export interface LegacySerializedElementProperty {
	model: Types.ModelName.ElementProperty;
	id: string;
	patternPropertyId: string;
	value: Types.ElementPropertyValue;
}

export interface SerializedAlvaApp {
	id: string;
	model: Types.ModelName.AlvaApp;
	activeView: SerializedAlvaView;
	hasFocusedInput: boolean;
	hostType: string;
	panes: SerializedAppPane[];
	paneSizes: SerializedPaneSize[];
	searchTerm: string;
	state: SerializedAppState;
}

export interface SerializedElementAction {
	model: Types.ModelName.ElementAction;
	elementPropertyId: string;
	id: string;
	open: boolean;
	payload: string;
	payloadType: Types.ElementActionPayloadType;
	storeActionId: string;
	storePropertyId: string;
}

export interface SerializedElementActionPayload {
	model: Types.ModelName.ElementActionPayload;
	id: string;
	type: Types.ElementActionPayloadType;
	value: string;
}

export enum SerialializationType {
	Set = 'Set'
}

export interface ClipboardPayload {
	type: SerializedItemType;
	item: SerializedItem;
	project: SerializedProject;
}
