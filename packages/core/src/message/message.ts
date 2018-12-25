import { Envelope, EmptyEnvelope } from './envelope';
import * as Types from '../types';
import * as Mobx from 'mobx';

export enum MessageType {
	UpdateAvailable = 'update-available',
	UpdateUnavailable = 'update-unavailable',
	UpdateError = 'update-error',
	UpdateDownload = 'update-download',
	UpdateDownloadProgress = 'update-download-progress',
	UpdateDownloaded = 'update-downloaded',
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
	DeleteSelected = 'delete',
	DeleteElement = 'delete-page-element',
	DuplicateSelected = 'duplicate',
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
	ExportHtmlProjectResult = 'export-html-project-result',
	KeyboardChange = 'keyboard-change',
	Log = 'log',
	Maximize = 'maximize',
	AppUpdate = 'app-update',
	ProjectUpdate = 'project-update',
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
	SaveAs = 'save-as',
	SaveResult = 'save-result',
	SetPane = 'set-pane',
	ShowError = 'show-error',
	ShowMessage = 'show-message',
	SketchExportRequest = 'sketch-export-request',
	SketchExportResponse = 'sketch-export-response',
	StartApp = 'start-app',
	Undo = 'undo',
	UseFileRequest = 'use-file',
	UseFileResponse = 'use-file-response',
	UpdatePatternLibraryRequest = 'update-pattern-library-request',
	UpdatePatternLibraryResponse = 'update-pattern-library-response',
	ChangeUserStore = 'user-store-change',
	SelectElement = 'select-element',
	HighlightElement = 'highlight-element',
	WindowOpen = 'window-open',
	WindowClose = 'window-close',
	WindowFocused = 'window-focused',
	WindowBlured = 'window-blured',
	ChromeScreenShot = 'chrome-screenshot',
	ToggleFullScreen = 'toggle-fullscreen',
	ToggleDevTools = 'toggle-dev-tools',
	OpenWindow = 'open-window',
	ShowUpdateDetails = 'show-update-details',
	InstallUpdate = 'install-update'
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
	| ContextMenuRequest
	| CopyElement
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
	| CutElement
	| DeleteSelected
	| DeleteElement
	| DuplicateSelected
	| DuplicateElement
	| ExportHtmlProject
	| ExportPngPage
	| ExportSketchPage
	| KeyboardChange
	| Log
	| Maximize
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
	| SaveAs
	| SaveResult
	| SetPane
	| ShowError
	| ShowMessage
	| SketchExportRequest
	| SketchExportResponse
	| StartAppMessage
	| Undo
	| UpdatePatternLibraryRequest
	| UpdatePatternLibraryResponse
	| ChangeUserStore
	| SelectElement
	| HighlightElement
	| WindowClose
	| WindowOpen
	| ChromeScreenShot
	| UseFileRequest
	| UseFileResponse
	| ToggleFullScreen
	| ProjectUpdate
	| AppUpdate
	| WindowBlured
	| WindowFocused
	| ToggleDevTools
	| OpenWindow
	| CreateNewFileRequest
	| OpenFileRequest
	| UpdateAvailable
	| UpdateError
	| UpdateDownloadProgress
	| UpdateDownloaded
	| UpdateUnavailable
	| UpdateDownload
	| ShowUpdateDetails
	| InstallUpdate;

export type CreateNewFileRequest = Envelope<MessageType.CreateNewFileRequest, { replace: boolean }>;
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
		projectId: string;
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
export type ContextMenuRequest = Envelope<
	MessageType.ContextMenuRequest,
	Types.ContextMenuRequestPayload
>;
export type ContentRequest = EmptyEnvelope<MessageType.ContentRequest>;
export type ContentResponse = Envelope<MessageType.ContentResponse, string>;
export interface CopyPayload {
	itemType: Types.SerializedItemType;
	projectId: string;
	itemId: string;
}
export type Copy = Envelope<MessageType.Copy, CopyPayload>;
export type CopyElement = Envelope<MessageType.CopyElement, string>;
export type CreateNewPage = Envelope<MessageType.CreateNewPage, undefined>;
export type CreateScriptBundleRequest = Envelope<
	MessageType.CreateScriptBundleRequest,
	Types.SerializedProject
>;
export type CreateScriptBundleResponse = Envelope<
	MessageType.CreateScriptBundleResponse,
	Types.FilePayload[]
>;
export type Cut = Envelope<
	MessageType.Cut,
	{ projectId: string; item: Types.SerializedItem; itemType: Types.SerializedItemType }
>;
export type DeleteSelected = EmptyEnvelope<MessageType.DeleteSelected>;
export type KeyboardChange = Envelope<MessageType.KeyboardChange, { metaDown: boolean }>;
export type NewFileRequest = EmptyEnvelope<MessageType.CreateNewFileRequest>;
export type NewFileResponse = Envelope<MessageType.CreateNewFileResponse, Types.ProjectPayload>;
export type CutElement = Envelope<MessageType.CutElement, string>;
export type DeleteElement = Envelope<MessageType.DeleteElement, string>;
export type DuplicateSelected = EmptyEnvelope<MessageType.DuplicateSelected>;
export type DuplicateElement = Envelope<MessageType.DuplicateElement, string>;
// tslint:disable-next-line:no-any
export type Log = Envelope<MessageType.Log, any>;
export type Maximize = EmptyEnvelope<MessageType.Maximize>;
export type OpenExternalURL = Envelope<MessageType.OpenExternalURL, string>;
export type OpenFileRequest = Envelope<
	MessageType.OpenFileRequest,
	{ path?: string; silent?: boolean; replace: boolean; newWindow?: boolean }
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
	{ page: Types.SerializedPage; project?: Types.SerializedProject }
>;
export type ProjectRequest = EmptyEnvelope<MessageType.ProjectRequest>;
export type ProjectResponse = Envelope<
	MessageType.ProjectResponse,
	{ data: Types.SerializedProject | undefined; status: Types.ProjectStatus }
>;
export type Redo = EmptyEnvelope<MessageType.Redo>;
export type Reload = Envelope<MessageType.Reload, { forced: boolean } | undefined>;
export type Save = Envelope<MessageType.Save, { publish: boolean; projectId: string }>;
export type SaveAs = Envelope<MessageType.SaveAs, { projectId: string }>;
export type SaveResult = Envelope<
	MessageType.SaveResult,
	{ project: Types.SerializedProject; previous: string }
>;
export type SetPane = Envelope<MessageType.SetPane, { pane: Types.AppPane; visible: boolean }>;
export type ShowError = Envelope<
	MessageType.ShowError,
	{ message: string; detail: string; error?: { message: string; stack: string }; help?: string }
>;
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
		libId: string;
		projectId: string;
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
	{ path: string | undefined; projectId: string }
>;
export type ExportPngPage = Envelope<MessageType.ExportPngPage, { path: string | undefined }>;
export type ExportSketchPage = Envelope<MessageType.ExportSketchPage, { path: string | undefined }>;

export type ChangeProject = Envelope<
	MessageType.ChangeProject,
	{ project: Types.SerializedProject | undefined }
>;

export type ChangeUserStore = Envelope<
	MessageType.ChangeUserStore,
	{ userStore: Types.SerializedUserStore; projectId: string }
>;

export type HighlightElement = Envelope<
	MessageType.HighlightElement,
	{ element: Types.SerializedElement | undefined }
>;

export type SelectElement = Envelope<
	MessageType.SelectElement,
	{ element: Types.SerializedElement | undefined; projectId: string }
>;

export type Clipboard = Envelope<MessageType.Clipboard, Types.ClipboardPayload>;

export type WindowClose = EmptyEnvelope<MessageType.WindowClose>;
export type ChromeScreenShot = Envelope<
	MessageType.ChromeScreenShot,
	{
		width: number;
		height: number;
	}
>;

export type WindowOpen = Envelope<
	MessageType.WindowOpen,
	{
		windowId: string;
		projectId: string;
		projectPath: string;
	}
>;

export type UseFileRequest = Envelope<
	MessageType.UseFileRequest,
	{ contents: string; silent: boolean; replace: boolean; path?: string }
>;

export type UseFileResponse = Envelope<
	MessageType.UseFileResponse,
	{
		project: Types.ProjectPayload;
		replace: boolean;
	}
>;

export type ShowMessage = Envelope<
	MessageType.ShowMessage,
	{
		message: string;
		detail?: string;
		buttons: {
			id?: string;
			label: string;
			message?: Message;
		}[];
	}
>;

export type ToggleFullScreen = EmptyEnvelope<MessageType.ToggleFullScreen>;

export type MobxMapChange = Mobx.IMapDidChange;
export type MobxChange =
	| Mobx.IObjectDidChange
	| Mobx.IArrayChange
	| Mobx.IArraySplice
	| Mobx.IMapDidChange;

export type ProjectUpdate = Envelope<
	MessageType.ProjectUpdate,
	{
		change: MobxChange;
		path: string;
		projectId: string;
	}
>;

export type AppUpdate = Envelope<
	MessageType.AppUpdate,
	{
		change: MobxChange;
		path: string;
		appId: string;
	}
>;

export type WindowFocused = Envelope<
	MessageType.WindowFocused,
	{
		app: Types.SerializedAlvaApp;
		projectId?: string;
	}
>;

export type WindowBlured = Envelope<
	MessageType.WindowBlured,
	{
		app: Types.SerializedAlvaApp;
		projectId?: string;
	}
>;

export type ToggleDevTools = EmptyEnvelope<MessageType.ToggleDevTools>;

export type OpenWindow = Envelope<
	MessageType.OpenWindow,
	{
		view: Types.AlvaView;
		projectId: string;
	}
>;

export type UpdateAvailable = Envelope<MessageType.UpdateAvailable, Types.UpdateInfo>;

export type UpdateUnavailable = EmptyEnvelope<MessageType.UpdateUnavailable>;

export type UpdateError = Envelope<
	MessageType.UpdateError,
	{
		error: {
			message: string;
		};
	}
>;

export type UpdateDownloadProgress = Envelope<
	MessageType.UpdateDownloadProgress,
	Types.UpdateDownloadProgress
>;

export type UpdateDownloaded = Envelope<MessageType.UpdateDownloaded, Types.UpdateInfo>;

export type UpdateDownload = Envelope<MessageType.UpdateDownload, Types.UpdateInfo>;

export type ShowUpdateDetails = Envelope<MessageType.ShowUpdateDetails, Types.UpdateInfo>;

export type InstallUpdate = EmptyEnvelope<MessageType.InstallUpdate>;
