import { Envelope, EmptyEnvelope } from './envelope';
import * as Types from '../types';

export enum ServerMessageType {
	ActivatePage = 'activate-page',
	AppLoaded = 'app-loaded',
	AppRequest = 'app-request',
	AppResponse = 'app-response',
	AssetReadRequest = 'asset-read-request',
	AssetReadResponse = 'asset-read-response',
	BundleChange = 'bundle-change',
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
	ChangeHighlightedElement = 'change-highlighted-element',
	ChangeHighlightedElementContent = 'change-highlighted-element-content',
	ChangePages = 'change-pages',
	ChangePatternLibraries = 'change-pattern-library',
	ChangeProject = 'change-project',
	ChangeSelectedElement = 'change-selected-element',
	ChangeSelectedElementContent = 'change-selected-element-content',
	ExportPngPage = 'export-png-page',
	ExportSketchPage = 'export-sketch-page',
	ExportHtmlProject = 'export-html-project',
	HighlightElement = 'highlight-element',
	KeyboardChange = 'keyboard-change',
	Log = 'log',
	Maximize = 'maximize',
	OpenExternalURL = 'open-external-url',
	OpenFileRequest = 'open-file-request',
	OpenFileResponse = 'open-file-response',
	PageChange = 'page-change',
	ProjectChange = 'project-change',
	Paste = 'paste',
	PasteElementBelow = 'paste-page-element-below',
	PasteElementInside = 'paste-page-element-inside',
	ProjectRequest = 'project-request',
	ProjectResponse = 'project-response',
	Redo = 'redo',
	Reload = 'reload',
	Save = 'save',
	SetPane = 'set-pane',
	SelectElement = 'select-element',
	ShowError = 'show-error',
	SketchExportRequest = 'sketch-export-request',
	SketchExportResponse = 'sketch-export-response',
	StartApp = 'start-app',
	Undo = 'undo',
	UnselectElement = 'unselect-element',
	UpdatePatternLibraryRequest = 'update-pattern-library-request',
	UpdatePatternLibraryResponse = 'update-pattern-library-response',
	UnHighlightElement = 'unhighlight-element'
}

export type ServerMessage =
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
	| ChangeHighlightedElement
	| ChangeSelectedElement
	| ChangeHighlightedElementContent
	| ChangeSelectedElementContent
	| ChangePatternLibraries
	| ChangePages
	| ChangeProject
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
	| HighlightElement
	| KeyboardChange
	| Log
	| Maximize
	| OpenExternalURL
	| OpenFileRequest
	| OpenFileResponse
	| PageChange
	| ProjectChange
	| Paste
	| PastePageElementBelow
	| PastePageElementInside
	| ProjectRequest
	| ProjectResponse
	| Redo
	| Reload
	| Save
	| SelectElement
	| SetPane
	| ShowError
	| SketchExportRequest
	| SketchExportResponse
	| StartAppMessage
	| Undo
	| UnselectElement
	| UpdatePatternLibraryRequest
	| UpdatePatternLibraryResponse
	| UnHighlightElement;

export type ActivatePage = Envelope<ServerMessageType.ActivatePage, { id: string }>;
export type AppLoaded = EmptyEnvelope<ServerMessageType.AppLoaded>;
export type AppRequest = EmptyEnvelope<ServerMessageType.AppRequest>;
export type AppResponse = Envelope<ServerMessageType.AppResponse, { app: Types.SerializedAlvaApp }>;
export type AssetReadRequest = EmptyEnvelope<ServerMessageType.AssetReadRequest>;
export type AssetReadResponse = Envelope<ServerMessageType.AssetReadResponse, string | undefined>;
export type ChangeActivePage = Envelope<ServerMessageType.ChangeActivePage, string | undefined>;
export type ChangeApp = Envelope<ServerMessageType.ChangeApp, { app: Types.SerializedAlvaApp }>;
export type ChangeElements = Envelope<
	ServerMessageType.ChangeElements,
	{ elements: Types.SerializedElement[]; elementContents: Types.SerializedElementContent[] }
>;
export type ChangeHighlightedElement = Envelope<
	ServerMessageType.ChangeHighlightedElement,
	string | undefined
>;
export type ChangeSelectedElement = Envelope<
	ServerMessageType.ChangeSelectedElement,
	string | undefined
>;
export type ChangeHighlightedElementContent = Envelope<
	ServerMessageType.ChangeHighlightedElementContent,
	string | undefined
>;
export type ChangeSelectedElementContent = Envelope<
	ServerMessageType.ChangeSelectedElementContent,
	string | undefined
>;
export type ChangePages = Envelope<
	ServerMessageType.ChangePages,
	{
		pages: Types.SerializedPage[];
	}
>;
export type CheckForUpdatesRequest = EmptyEnvelope<ServerMessageType.CheckForUpdatesRequest>;
export type CheckLibraryRequest = Envelope<
	ServerMessageType.CheckLibraryRequest,
	{
		libraries: string[];
	}
>;
export type CheckLibraryResponse = Envelope<
	ServerMessageType.CheckLibraryResponse,
	Types.LibraryCheckPayload[]
>;
export type ConnectedPatternLibraryNotification = Envelope<
	ServerMessageType.ConnectedPatternLibraryNotification,
	Types.LibraryNotificationPayload
>;
export type ConnectPatternLibraryRequest = Envelope<
	ServerMessageType.ConnectPatternLibraryRequest,
	{
		library: string | undefined;
	}
>;
export type ConnectPatternLibraryResponse = Envelope<
	ServerMessageType.ConnectPatternLibraryResponse,
	{
		analysis: Types.LibraryAnalysis;
		path: string;
		previousLibraryId: string | undefined;
	}
>;
export type ContextMenuRequst = Envelope<
	ServerMessageType.ContextMenuRequest,
	Types.ContextMenuRequestPayload
>;
export type ContentRequest = EmptyEnvelope<ServerMessageType.ContentRequest>;
export type ContentResponse = Envelope<ServerMessageType.ContentResponse, string>;
export type Copy = EmptyEnvelope<ServerMessageType.Copy>;
export type CopyPageElement = Envelope<ServerMessageType.CopyElement, string>;
export type CreateNewPage = Envelope<ServerMessageType.CreateNewPage, undefined>;
export type CreateScriptBundleRequest = Envelope<
	ServerMessageType.CreateScriptBundleRequest,
	Types.SerializedProject
>;
export type CreateScriptBundleResponse = Envelope<
	ServerMessageType.CreateScriptBundleResponse,
	Types.FilePayload[]
>;
export type Cut = EmptyEnvelope<ServerMessageType.Cut>;
export type Delete = EmptyEnvelope<ServerMessageType.Delete>;
export type HighlightElement = Envelope<ServerMessageType.HighlightElement, Types.PatternIdPayload>;
export type KeyboardChange = Envelope<ServerMessageType.KeyboardChange, { metaDown: boolean }>;
export type NewFileRequest = EmptyEnvelope<ServerMessageType.CreateNewFileRequest>;
export type NewFileResponse = Envelope<
	ServerMessageType.CreateNewFileResponse,
	Types.ProjectPayload
>;
export type CutPageElement = Envelope<ServerMessageType.CutElement, string>;
export type DeletePageElement = Envelope<ServerMessageType.DeleteElement, string>;
export type Duplicate = EmptyEnvelope<ServerMessageType.Duplicate>;
export type DuplicatePageElement = Envelope<ServerMessageType.DuplicateElement, string>;
// tslint:disable-next-line:no-any
export type Log = Envelope<ServerMessageType.Log, any>;
export type Maximize = EmptyEnvelope<ServerMessageType.Maximize>;
export type OpenExternalURL = Envelope<ServerMessageType.OpenExternalURL, string>;
export type OpenFileRequest = Envelope<
	ServerMessageType.OpenFileRequest,
	{ path: string } | undefined
>;
export type OpenFileResponse = Envelope<ServerMessageType.OpenFileResponse, Types.ProjectPayload>;
export type PageChange = Envelope<ServerMessageType.PageChange, Types.PageChangePayload>;
export type ProjectChange = Envelope<ServerMessageType.ProjectChange, Types.SerializedProject>;
export type Paste = EmptyEnvelope<ServerMessageType.Paste>;
export type PastePageElementBelow = Envelope<ServerMessageType.PasteElementBelow, string>;
export type PastePageElementInside = Envelope<ServerMessageType.PasteElementInside, string>;
export type ProjectRequest = EmptyEnvelope<ServerMessageType.ProjectRequest>;
export type ProjectResponse = Envelope<
	ServerMessageType.ProjectResponse,
	{ data: Types.SerializedProject | undefined; status: Types.ProjectStatus }
>;
export type Redo = EmptyEnvelope<ServerMessageType.Redo>;
export type Reload = EmptyEnvelope<ServerMessageType.Reload>;
export type Save = Envelope<ServerMessageType.Save, Types.SavePayload>;
export type SelectElement = Envelope<ServerMessageType.SelectElement, Types.PatternIdPayload>;
export type SetPane = Envelope<
	ServerMessageType.SetPane,
	{ pane: Types.AppPane; visible: boolean }
>;
export type ShowError = Envelope<ServerMessageType.ShowError, { message: string; stack: string }>;
export type SketchExportRequest = Envelope<
	ServerMessageType.SketchExportRequest,
	Types.SketchExportPayload
>;
export type SketchExportResponse = Envelope<ServerMessageType.SketchExportResponse, string>;
export type StartAppMessage = Envelope<
	ServerMessageType.StartApp,
	{
		app: Types.SerializedAlvaApp | undefined;
		port: number;
	}
>;
export type ChangePatternLibraries = Envelope<
	ServerMessageType.ChangePatternLibraries,
	{
		patternLibraries: Types.SerializedPatternLibrary[];
	}
>;
export type Undo = EmptyEnvelope<ServerMessageType.Undo>;
export type UnselectElement = EmptyEnvelope<ServerMessageType.UnselectElement>;
export type UpdatePatternLibraryRequest = Envelope<
	ServerMessageType.UpdatePatternLibraryRequest,
	{
		id: string;
	}
>;
export type UpdatePatternLibraryResponse = Envelope<
	ServerMessageType.UpdatePatternLibraryResponse,
	{
		analysis: Types.LibraryAnalysis;
		path: string;
		previousLibraryId: string;
	}
>;
export type UnHighlightElement = EmptyEnvelope<ServerMessageType.UnHighlightElement>;

export type ExportHtmlProject = Envelope<
	ServerMessageType.ExportHtmlProject,
	{ path: string | undefined }
>;
export type ExportPngPage = Envelope<ServerMessageType.ExportPngPage, { path: string | undefined }>;
export type ExportSketchPage = Envelope<
	ServerMessageType.ExportSketchPage,
	{ path: string | undefined }
>;

export type ChangeProject = Envelope<
	ServerMessageType.ChangeProject,
	{ project: Types.SerializedProject }
>;
