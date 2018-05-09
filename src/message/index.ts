import { SerializedProject } from '../store/types';

export enum PreviewMessageType {
	ContentRequest = 'content-request',
	ContentResponse = 'content-response',
	ElementChange = 'element-change',
	Reload = 'reload',
	SketchExportRequest = 'sketch-export-request',
	SketchExportResponse = 'sketch-export-response',
	State = 'state',
	Update = 'update'
}

export enum ServerMessageType {
	AppLoaded = 'app-loaded',
	AssetReadRequest = 'asset-read-request',
	AssetReadResponse = 'asset-read-response',
	BundleChange = 'bundle-change',
	ContentRequest = 'content-request',
	ContentResponse = 'content-response',
	Copy = 'copy',
	CopyPageElement = 'copy-page-element',
	CreateNewFileRequest = 'create-new-file-request',
	CreateNewFileResponse = 'create-new-file-response',
	Cut = 'cut',
	CutPageElement = 'cut-page-element',
	Delete = 'delete',
	DeletePageElement = 'delete-page-element',
	Duplicate = 'duplicate',
	DuplicatePageElement = 'duplicate-page-element',
	ElementChange = 'element-change',
	OpenFileRequest = 'open-file-request',
	OpenFileResponse = 'open-file-response',
	PageChange = 'page-change',
	Paste = 'paste',
	PastePageElementBelow = 'paste-page-element-below',
	PastePageElementInside = 'paste-page-element-inside',
	Redo = 'redo',
	Save = 'save',
	SketchExportRequest = 'sketch-export-request',
	SketchExportResponse = 'sketch-export-response',
	StartApp = 'start-app',
	StyleGuideChange = 'styleguide-change',
	Undo = 'undo'
}

export interface Envelope<V, T> {
	id: string;
	payload: T;
	type: V;
}

export interface ProjectFilePayload {
	contents: SerializedProject;
	path: string;
}

export type ServerMessage =
	| AssetReadResponse
	| CreateNewFileResponse
	| ContentRequest
	| ContentResponse
	| OpenFileResponse
	| SketchExportRequest
	| SketchExportResponse
	| StartAppMessage;

export type AssetReadResponse = Envelope<ServerMessageType.AssetReadResponse, string>;
export type StartAppMessage = Envelope<ServerMessageType.StartApp, string>;
export type ContentRequest = Envelope<ServerMessageType.ContentRequest, undefined>;
export type ContentResponse = Envelope<ServerMessageType.ContentResponse, string>;
export type SketchExportRequest = Envelope<ServerMessageType.SketchExportRequest, undefined>;
export type SketchExportResponse = Envelope<ServerMessageType.SketchExportResponse, string>;
export type CreateNewFileResponse = Envelope<
	ServerMessageType.CreateNewFileResponse,
	ProjectFilePayload
>;
export type OpenFileResponse = Envelope<ServerMessageType.OpenFileResponse, ProjectFilePayload>;
