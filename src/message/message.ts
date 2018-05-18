import * as Types from '../model/types';

export enum PreviewMessageType {
	ContentRequest = 'content-request',
	ContentResponse = 'content-response',
	ElementChange = 'element-change',
	Reload = 'reload',
	SelectElement = 'select-element',
	SketchExportRequest = 'sketch-export-request',
	SketchExportResponse = 'sketch-export-response',
	State = 'state',
	UnselectElement = 'unselect-element',
	Update = 'update'
}

export enum ServerMessageType {
	AppLoaded = 'app-loaded',
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
	DroppedFile = 'dropped-file',
	CreateNewPlaceholder = 'create-new-placeholder',
	ElementChange = 'element-change',
	ExportHTML = 'export-html',
	ExportPDF = 'export-pdf',
	ExportPNG = 'export-png',
	ExportSketch = 'export-sketch',
	OpenFileRequest = 'open-file-request',
	OpenFileResponse = 'open-file-response',
	PageChange = 'page-change',
	ProjectChange = 'project-change',
	Paste = 'paste',
	PasteElementBelow = 'paste-page-element-below',
	PasteElementInside = 'paste-page-element-inside',
	Redo = 'redo',
	Save = 'save',
	SelectElement = 'select-element',
	SketchExportRequest = 'sketch-export-request',
	SketchExportResponse = 'sketch-export-response',
	StartApp = 'start-app',
	PatternLibraryChange = 'pattern-library-change',
	Undo = 'undo',
	UnselectElement = 'unselect-element',
	UpdatePatternLibraryRequest = 'update-pattern-library-request'
}

export interface Envelope<V, T> {
	id: string;
	payload: T;
	type: V;
}

export type EmptyEnvelope<V> = Envelope<V, undefined>;

export type ServerMessage =
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
	| CopyPageElement
	| CreateNewPage
	| CreateScriptBundleRequest
	| CreateScriptBundleResponse
	| ElementChange
	| NewFileRequest
	| NewFileResponse
	| Copy
	| Cut
	| CutPageElement
	| Delete
	| DeletePageElement
	| Duplicate
	| DuplicatePageElement
	| DroppedFile
	| CreateNewPlaceholder
	| ExportHTML
	| ExportPDF
	| ExportPNG
	| ExportSketch
	| OpenFileRequest
	| OpenFileResponse
	| PageChange
	| ProjectChange
	| Paste
	| PastePageElementBelow
	| PastePageElementInside
	| Redo
	| Save
	| SelectElement
	| SketchExportRequest
	| SketchExportResponse
	| StartAppMessage
	| StyleGuideChange
	| Undo
	| UnselectElement
	| UpdatePatternLibraryRequest;

export type AppLoaded = EmptyEnvelope<ServerMessageType.AppLoaded>;
export type AssetReadRequest = EmptyEnvelope<ServerMessageType.AssetReadRequest>;
export type AssetReadResponse = Envelope<ServerMessageType.AssetReadResponse, string>;
export type CheckForUpdatesRequest = EmptyEnvelope<ServerMessageType.CheckForUpdatesRequest>;
export type CheckLibraryRequest = Envelope<
	ServerMessageType.CheckLibraryRequest,
	Types.SerializedProject
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
	Types.SerializedProject
>;
export type ConnectPatternLibraryResponse = Envelope<
	ServerMessageType.ConnectPatternLibraryResponse,
	Types.ImportPayload
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
export type ElementChange = Envelope<ServerMessageType.ElementChange, string | undefined>;
export type ExportHTML = Envelope<ServerMessageType.ExportHTML, Types.ExportPayload>;
export type ExportPDF = Envelope<ServerMessageType.ExportPDF, Types.ExportPayload>;
export type ExportPNG = Envelope<ServerMessageType.ExportPNG, Types.ExportPayload>;
export type ExportSketch = Envelope<ServerMessageType.ExportSketch, Types.ExportPayload>;
export type NewFileRequest = EmptyEnvelope<ServerMessageType.CreateNewFileRequest>;
export type NewFileResponse = Envelope<
	ServerMessageType.CreateNewFileResponse,
	Types.ProjectPayload
>;
export type CutPageElement = Envelope<ServerMessageType.CutElement, string>;
export type DeletePageElement = Envelope<ServerMessageType.DeleteElement, string>;
export type Duplicate = EmptyEnvelope<ServerMessageType.Duplicate>;
export type DuplicatePageElement = Envelope<ServerMessageType.DuplicateElement, string>;
export type DroppedFile = Envelope<
	ServerMessageType.DroppedFile,
	{
		isSiblingDrop: boolean;
		path: string;
		targetContentId: string;
		targetElementId: string;
	}
>;
export type CreateNewPlaceholder = Envelope<
	ServerMessageType.CreateNewPlaceholder,
	{
		data: string;
		isSiblingDrop: boolean;
		targetContentId: string;
		targetElementId: string;
	}
>;
export type OpenFileRequest = EmptyEnvelope<ServerMessageType.OpenFileRequest>;
export type OpenFileResponse = Envelope<ServerMessageType.OpenFileResponse, Types.ProjectPayload>;
export type PageChange = Envelope<ServerMessageType.PageChange, Types.PageChangePayload>;
export type ProjectChange = Envelope<ServerMessageType.ProjectChange, Types.SerializedProject>;
export type Paste = EmptyEnvelope<ServerMessageType.Paste>;
export type PastePageElementBelow = Envelope<ServerMessageType.PasteElementBelow, string>;
export type PastePageElementInside = Envelope<ServerMessageType.PasteElementInside, string>;
export type Redo = EmptyEnvelope<ServerMessageType.Redo>;
export type Save = Envelope<ServerMessageType.Save, Types.SavePayload>;
export type SelectElement = Envelope<ServerMessageType.SelectElement, Types.SelectPayload>;
export type SketchExportRequest = Envelope<
	ServerMessageType.SketchExportRequest,
	Types.SketchExportPayload
>;
export type SketchExportResponse = Envelope<ServerMessageType.SketchExportResponse, string>;
export type StartAppMessage = Envelope<ServerMessageType.StartApp, string>;
export type StyleGuideChange = Envelope<
	ServerMessageType.PatternLibraryChange,
	Types.SerializedPatternLibrary
>;
export type Undo = EmptyEnvelope<ServerMessageType.Undo>;
export type UnselectElement = EmptyEnvelope<ServerMessageType.UnselectElement>;
export type UpdatePatternLibraryRequest = Envelope<
	ServerMessageType.UpdatePatternLibraryRequest,
	Types.SerializedProject
>;
