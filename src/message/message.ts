import { Envelope, EmptyEnvelope } from './envelope';
import * as Types from '../types';

export enum MessageType {
	ActivatePage = 'activate-page',
	AppLoaded = 'app-loaded',
	AppRequest = 'app-request',
	AppResponse = 'app-response',
	AssetReadRequest = 'asset-read-request',
	AssetReadResponse = 'asset-read-response',
	BundleChange = 'bundle-change',
	Clipboard = 'clipboard',
	CheckForUpdatesRequest = 'check-for-updates-request',
	CheckLibraryRequest = 'check-library-request',
	CheckLibraryResponse = 'check-library-response',
	ConnectedPatternLibraryNotification = 'connected-pattern-library-notification',
	ConnectPatternLibraryRequest = 'connect-pattern-library-request',
	ConnectPatternLibraryResponse = 'connect-pattern-library-response',
	ContentRequest = 'content-request',
	ContentResponse = 'content-response',
	ContextMenuRequest = 'context-menu-request',
	Copy = 'copy',
	CopyElement = 'copy-page-element',
	CreateNewFileRequest = 'create-new-file-request',
	CreateNewFileResponse = 'create-new-file-response',
	CreateNewPage = 'create-new-page',
	CreateScriptBundleRequest = 'create-script-bundle-request',
	CreateScriptBundleResponse = 'create-script-bundle-response',
	Cut = 'cut',
	CutElement = 'cut-page-element',
	Delete = 'delete',
	DeleteElement = 'delete-page-element',
	Duplicate = 'duplicate',
	DuplicateElement = 'duplicate-page-element',
	ChangeActivePage = 'change-active-page',
	ChangeApp = 'change-app',
	ChangeElements = 'change-elements',
	ChangeElementActions = 'change-element-actions',
	ChangeElementContents = 'change-element-contents',
	ChangePages = 'change-pages',
	ChangePatternLibraries = 'change-pattern-library',
	ChangeProject = 'change-project',
	ExportPngPage = 'export-png-page',
	ExportSketchPage = 'export-sketch-page',
	ExportHtmlProject = 'export-html-project',
	KeyboardChange = 'keyboard-change',
	Log = 'log',
	Maximize = 'maximize',
	MobxAdd = 'mobx-add',
	MobxDelete = 'mobx-delete',
	MobxUpdate = 'mobx-update',
	MobxSplice = 'mobx-splice',
	OpenExternalURL = 'open-external-url',
	OpenFileRequest = 'open-file-request',
	OpenFileResponse = 'open-file-response',
	PageChange = 'page-change',
	ProjectChange = 'project-change',
	Paste = 'paste',
	PasteElement = 'paste-element',
	PastePage = 'paste-page',
	ProjectRequest = 'project-request',
	ProjectResponse = 'project-response',
	Redo = 'redo',
	Reload = 'reload',
	Save = 'save',
	SetPane = 'set-pane',
	ShowError = 'show-error',
	SketchExportRequest = 'sketch-export-request',
	SketchExportResponse = 'sketch-export-response',
	StartApp = 'start-app',
	Undo = 'undo',
	UpdatePatternLibraryRequest = 'update-pattern-library-request',
	UpdatePatternLibraryResponse = 'update-pattern-library-response',
	ChangeUserStore = 'user-store-change',
	SelectElement = 'select-element',
	HighlightElement = 'highlight-element'
}

export type Message =
	| ActivatePage
	| AppRequest
	| AppResponse
	| AppLoaded
	| AssetReadRequest
	| AssetReadResponse
	| CheckForUpdatesRequest
	| CheckLibraryRequest
	| CheckLibraryResponse
	| ConnectPatternLibraryRequest
	| ConnectPatternLibraryResponse
	| ConnectedPatternLibraryNotification
	| ContentRequest
	| ContentResponse
	| ContextMenuRequst
	| CopyPageElement
	| CreateNewPage
	| CreateScriptBundleRequest
	| CreateScriptBundleResponse
	| ChangeActivePage
	| ChangeApp
	| ChangeElements
	| ChangeElementActions
	| ChangeElementContents
	| ChangePatternLibraries
	| ChangePages
	| ChangeProject
	| Clipboard
	| NewFileRequest
	| NewFileResponse
	| Copy
	| Cut
	| CutPageElement
	| Delete
	| DeletePageElement
	| Duplicate
	| DuplicatePageElement
	| ExportHtmlProject
	| ExportPngPage
	| ExportSketchPage
	| KeyboardChange
	| Log
	| Maximize
	| MobxAddMessage
	| MobxDeleteMessage
	| MobxUpdateMessage
	| MobxSpliceMessage
	| OpenExternalURL
	| OpenFileRequest
	| OpenFileResponse
	| PageChange
	| ProjectChange
	| Paste
	| PasteElement
	| PastePage
	| ProjectRequest
	| ProjectResponse
	| Redo
	| Reload
	| Save
	| SetPane
	| ShowError
	| SketchExportRequest
	| SketchExportResponse
	| StartAppMessage
	| Undo
	| UpdatePatternLibraryRequest
	| UpdatePatternLibraryResponse
	| ChangeUserStore
	| SelectElement
	| HighlightElement;

export type ActivatePage = Envelope<MessageType.ActivatePage, { id: string }>;
export type AppLoaded = EmptyEnvelope<MessageType.AppLoaded>;
export type AppRequest = EmptyEnvelope<MessageType.AppRequest>;
export type AppResponse = Envelope<MessageType.AppResponse, { app: Types.SerializedAlvaApp }>;
export type AssetReadRequest = EmptyEnvelope<MessageType.AssetReadRequest>;
export type AssetReadResponse = Envelope<MessageType.AssetReadResponse, string | undefined>;
export type ChangeActivePage = Envelope<MessageType.ChangeActivePage, string | undefined>;
export type ChangeApp = Envelope<MessageType.ChangeApp, { app: Types.SerializedAlvaApp }>;
export type ChangeElements = Envelope<
	MessageType.ChangeElements,
	{ elements: Types.SerializedElement[] }
>;
export type ChangeElementContents = Envelope<
	MessageType.ChangeElementContents,
	{ elementContents: Types.SerializedElementContent[] }
>;
export type ChangeElementActions = Envelope<
	MessageType.ChangeElementActions,
	{ elementActions: Types.SerializedElementAction[] }
>;
export type ChangePages = Envelope<
	MessageType.ChangePages,
	{
		pages: Types.SerializedPage[];
	}
>;
export type CheckForUpdatesRequest = EmptyEnvelope<MessageType.CheckForUpdatesRequest>;
export type CheckLibraryRequest = Envelope<
	MessageType.CheckLibraryRequest,
	{
		libraries: string[];
	}
>;
export type CheckLibraryResponse = Envelope<
	MessageType.CheckLibraryResponse,
	Types.LibraryCheckPayload[]
>;
export type ConnectedPatternLibraryNotification = Envelope<
	MessageType.ConnectedPatternLibraryNotification,
	Types.LibraryNotificationPayload
>;
export type ConnectPatternLibraryRequest = Envelope<
	MessageType.ConnectPatternLibraryRequest,
	{
		library: string | undefined;
	}
>;
export type ConnectPatternLibraryResponse = Envelope<
	MessageType.ConnectPatternLibraryResponse,
	{
		analysis: Types.LibraryAnalysis;
		path: string;
		previousLibraryId: string | undefined;
	}
>;
export type ContextMenuRequst = Envelope<
	MessageType.ContextMenuRequest,
	Types.ContextMenuRequestPayload
>;
export type ContentRequest = EmptyEnvelope<MessageType.ContentRequest>;
export type ContentResponse = Envelope<MessageType.ContentResponse, string>;
export type Copy = Envelope<
	MessageType.Copy,
	{ type: Types.SerializedItemType; id: string } | undefined
>;
export type CopyPageElement = Envelope<MessageType.CopyElement, string>;
export type CreateNewPage = Envelope<MessageType.CreateNewPage, undefined>;
export type CreateScriptBundleRequest = Envelope<
	MessageType.CreateScriptBundleRequest,
	Types.SerializedProject
>;
export type CreateScriptBundleResponse = Envelope<
	MessageType.CreateScriptBundleResponse,
	Types.FilePayload[]
>;
export type Cut = EmptyEnvelope<MessageType.Cut>;
export type Delete = EmptyEnvelope<MessageType.Delete>;
export type KeyboardChange = Envelope<MessageType.KeyboardChange, { metaDown: boolean }>;
export type NewFileRequest = EmptyEnvelope<MessageType.CreateNewFileRequest>;
export type NewFileResponse = Envelope<MessageType.CreateNewFileResponse, Types.ProjectPayload>;
export type CutPageElement = Envelope<MessageType.CutElement, string>;
export type DeletePageElement = Envelope<MessageType.DeleteElement, string>;
export type Duplicate = EmptyEnvelope<MessageType.Duplicate>;
export type DuplicatePageElement = Envelope<MessageType.DuplicateElement, string>;
// tslint:disable-next-line:no-any
export type Log = Envelope<MessageType.Log, any>;
export type Maximize = EmptyEnvelope<MessageType.Maximize>;
export type OpenExternalURL = Envelope<MessageType.OpenExternalURL, string>;
export type OpenFileRequest = Envelope<
	MessageType.OpenFileRequest,
	{ path: string; silent?: boolean } | undefined
>;
export type OpenFileResponse = Envelope<MessageType.OpenFileResponse, Types.ProjectPayload>;
export type PageChange = Envelope<MessageType.PageChange, Types.PageChangePayload>;
export type ProjectChange = Envelope<MessageType.ProjectChange, Types.SerializedProject>;
export type Paste = Envelope<
	MessageType.Paste,
	undefined | { targetType: Types.ElementTargetType; id: string }
>;
export type PasteElement = Envelope<
	MessageType.PasteElement,
	{
		element: Types.SerializedElement;
		project: Types.SerializedProject;
		targetType: Types.ElementTargetType;
		targetId?: string;
	}
>;
export type PastePage = Envelope<
	MessageType.PastePage,
	{ page: Types.SerializedPage; project: Types.SerializedProject }
>;
export type ProjectRequest = EmptyEnvelope<MessageType.ProjectRequest>;
export type ProjectResponse = Envelope<
	MessageType.ProjectResponse,
	{ data: Types.SerializedProject | undefined; status: Types.ProjectStatus }
>;
export type Redo = EmptyEnvelope<MessageType.Redo>;
export type Reload = Envelope<MessageType.Reload, { forced: boolean } | undefined>;
export type Save = Envelope<MessageType.Save, Types.SavePayload>;
export type SetPane = Envelope<MessageType.SetPane, { pane: Types.AppPane; visible: boolean }>;
export type ShowError = Envelope<MessageType.ShowError, { message: string; stack: string }>;
export type SketchExportRequest = Envelope<
	MessageType.SketchExportRequest,
	Types.SketchExportPayload
>;
export type SketchExportResponse = Envelope<MessageType.SketchExportResponse, string>;
export type StartAppMessage = Envelope<
	MessageType.StartApp,
	{
		app: Types.SerializedAlvaApp | undefined;
		port: number;
	}
>;
export type ChangePatternLibraries = Envelope<
	MessageType.ChangePatternLibraries,
	{
		patternLibraries: Types.SerializedPatternLibrary[];
	}
>;
export type Undo = EmptyEnvelope<MessageType.Undo>;
export type UpdatePatternLibraryRequest = Envelope<
	MessageType.UpdatePatternLibraryRequest,
	{
		id: string;
	}
>;
export type UpdatePatternLibraryResponse = Envelope<
	MessageType.UpdatePatternLibraryResponse,
	{
		analysis: Types.LibraryAnalysis;
		path: string;
		previousLibraryId: string;
	}
>;
export type ExportHtmlProject = Envelope<
	MessageType.ExportHtmlProject,
	{ path: string | undefined }
>;
export type ExportPngPage = Envelope<MessageType.ExportPngPage, { path: string | undefined }>;
export type ExportSketchPage = Envelope<MessageType.ExportSketchPage, { path: string | undefined }>;

export type ChangeProject = Envelope<
	MessageType.ChangeProject,
	{ project: Types.SerializedProject | undefined }
>;

export type ChangeUserStore = Envelope<
	MessageType.ChangeUserStore,
	{ userStore: Types.SerializedUserStore }
>;

export type HighlightElement = Envelope<
	MessageType.HighlightElement,
	{ element: Types.SerializedElement | undefined }
>;

export type SelectElement = Envelope<
	MessageType.SelectElement,
	{ element: Types.SerializedElement | undefined }
>;

export type Clipboard = Envelope<
	MessageType.Clipboard,
	{
		type: Types.SerializedItemType;
		item: Types.SerializedItem;
		project: Types.SerializedProject;
	}
>;

export interface MobxUpdatePayload {
	id: string;
	name: string;
	change: MobxUpdateChange;
}

export interface MobxAddPayload<T = unknown> {
	id: string;
	name: string;
	memberName: string;
	valueModel: Types.ModelName | undefined;
	change: MobxAddChange<T>;
}

export interface MobxDeletePayload {
	id: string;
	name: string;
	memberName: string;
	change: {
		type: Types.MobxChangeType.Delete;
		key: string;
	};
}

export interface MobxSplicePayload<T = unknown> {
	id: string;
	name: string;
	memberName: string;
	change: MobxSpliceChange<T>;
}

export interface MobxAddChange<T> {
	type: Types.MobxChangeType.Add;
	key: string;
	newValue: T;
}

export interface MobxSpliceChange<T> {
	type: Types.MobxChangeType.Splice;
	index: number;
	added: T[];
	removed: T[];
}

export type MobxUpdateChange =
	| MobxArrayUpdatePayload
	| MobxMapUpdatePayload
	| MobxObjectUpdatePayload;

export interface MobxArrayUpdatePayload<T = unknown> {
	type: Types.MobxChangeType.Update;
	index: number;
	newValue: T;
}

export interface MobxMapUpdatePayload<T = unknown> {
	type: Types.MobxChangeType.Update;
	key: string;
	newValue: T;
}

export interface MobxObjectUpdatePayload<T = unknown> {
	type: Types.MobxChangeType.Update;
	key: string;
	newValue: T;
}

export type MobxUpdateMessage = Envelope<MessageType.MobxUpdate, MobxUpdatePayload>;
export type MobxAddMessage = Envelope<MessageType.MobxAdd, MobxAddPayload>;
export type MobxDeleteMessage = Envelope<MessageType.MobxDelete, MobxDeletePayload>;
export type MobxSpliceMessage = Envelope<MessageType.MobxSplice, MobxSplicePayload>;
