import * as PatternProperty from './pattern-property';
import * as Types from './types';
import * as UserStore from './user-store';
import { UpdateInfo } from './updater';

export enum PatternOrigin {
	BuiltIn = 'built-in',
	UserProvided = 'user-provided'
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

export type SerializedPatternOrigin = 'built-in' | 'user-provided';

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
	icon: string;
	id: string;
	name: string;
	origin: SerializedPatternOrigin;
	propertyIds: string[];
	slots: SerializedPatternSlot[];
	type: SerializedPatternType;
}

export interface SerializedPatternSlot {
	model: Types.ModelName.PatternSlot;
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

export interface SerializedPatternLibrary {
	model: Types.ModelName.PatternLibrary;
	bundleId: string;
	bundle: string;
	description: string;
	id: string;
	name: string;
	version: string;
	origin: SerializedPatternLibraryOrigin;
	patternProperties: PatternProperty.SerializedPatternProperty[];
	patterns: SerializedPattern[];
	state: PatternLibraryState;
}

export interface SavedProject {
	model: Types.ModelName.Project;
	elementActions: SerializedElementAction[];
	elementContents: SerializedElementContent[];
	elements: SerializedElement[];
	id: string;
	name: string;
	pages: SerializedPage[];
	pageList: string[];
	patternLibraries: SerializedPatternLibrary[];
	userStore: UserStore.SerializedUserStore;
}

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
	placeholderHighlighted: boolean;
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
	notifications: UpdateInfo[];
	panes: SerializedAppPane[];
	paneSizes: SerializedPaneSize[];
	rightSidebarTab: SerializedRightSidebarTab;
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
