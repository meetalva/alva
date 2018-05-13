import { PatternLibrary } from '../store';
import * as Types from '../store/types';

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
	CreateNewPage = 'create-new-page',
	CreateScriptBundleRequest = 'create-script-bundle-request',
	CreateScriptBundleResponse = 'create-script-bundle-response',
	Cut = 'cut',
	CutPageElement = 'cut-page-element',
	Delete = 'delete',
	DeletePageElement = 'delete-page-element',
	Duplicate = 'duplicate',
	DuplicatePageElement = 'duplicate-page-element',
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

export type EmptyEnvelope<V> = Envelope<V, undefined>;

export interface PageChangePaylod {
	pageId: string;
	pages: Types.SerializedPage[];
}

export interface ProjectPayload {
	contents: Types.SerializedProject;
	path: string;
}

export interface SavePayload {
	path: string;
	project: Types.SerializedProject;
}

export interface SketchExportPayload {
	artboardName: string;
	pageName: string;
}

export interface ExportPayload {
	content: Buffer;
	path: string;
}

export type ServerMessage =
	| AppLoaded
	| AssetReadRequest
	| AssetReadResponse
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
	| SketchExportRequest
	| SketchExportResponse
	| StartAppMessage
	| StyleGuideChange
	| Undo;

export type AppLoaded = EmptyEnvelope<ServerMessageType.AppLoaded>;
export type AssetReadRequest = EmptyEnvelope<ServerMessageType.AssetReadRequest>;
export type AssetReadResponse = Envelope<ServerMessageType.AssetReadResponse, string>;
export type ContentRequest = EmptyEnvelope<ServerMessageType.ContentRequest>;
export type ContentResponse = Envelope<ServerMessageType.ContentResponse, string>;
export type Copy = EmptyEnvelope<ServerMessageType.Copy>;
export type CopyPageElement = Envelope<ServerMessageType.CopyPageElement, string>;
export type CreateNewPage = Envelope<ServerMessageType.CreateNewPage, undefined>;
export type CreateScriptBundleRequest = Envelope<
	ServerMessageType.CreateScriptBundleRequest,
	PatternLibrary
>;
export type CreateScriptBundleResponse = Envelope<
	ServerMessageType.CreateScriptBundleResponse,
	string
>;
export type Cut = EmptyEnvelope<ServerMessageType.Cut>;
export type Delete = EmptyEnvelope<ServerMessageType.Delete>;
export type ElementChange = Envelope<ServerMessageType.ElementChange, string | undefined>;
export type ExportHTML = Envelope<ServerMessageType.ExportHTML, ExportPayload>;
export type ExportPDF = Envelope<ServerMessageType.ExportPDF, ExportPayload>;
export type ExportPNG = Envelope<ServerMessageType.ExportPNG, ExportPayload>;
export type ExportSketch = Envelope<ServerMessageType.ExportSketch, ExportPayload>;
export type NewFileRequest = EmptyEnvelope<ServerMessageType.CreateNewFileRequest>;
export type NewFileResponse = Envelope<ServerMessageType.CreateNewFileResponse, ProjectPayload>;
export type CutPageElement = Envelope<ServerMessageType.CutPageElement, string>;
export type DeletePageElement = Envelope<ServerMessageType.DeletePageElement, string>;
export type Duplicate = EmptyEnvelope<ServerMessageType.Duplicate>;
export type DuplicatePageElement = Envelope<ServerMessageType.DuplicatePageElement, string>;
export type OpenFileRequest = EmptyEnvelope<ServerMessageType.OpenFileRequest>;
export type OpenFileResponse = Envelope<ServerMessageType.OpenFileResponse, ProjectPayload>;
export type PageChange = Envelope<ServerMessageType.PageChange, PageChangePaylod>;
export type ProjectChange = Envelope<ServerMessageType.ProjectChange, Types.SerializedProject>;
export type Paste = EmptyEnvelope<ServerMessageType.Paste>;
export type PastePageElementBelow = Envelope<ServerMessageType.PastePageElementBelow, string>;
export type PastePageElementInside = Envelope<ServerMessageType.PastePageElementInside, string>;
export type Redo = EmptyEnvelope<ServerMessageType.Redo>;
export type Save = Envelope<ServerMessageType.Save, SavePayload>;
export type SketchExportRequest = Envelope<
	ServerMessageType.SketchExportRequest,
	SketchExportPayload
>;
export type SketchExportResponse = Envelope<ServerMessageType.SketchExportResponse, string>;
export type StartAppMessage = Envelope<ServerMessageType.StartApp, string>;
export type StyleGuideChange = Envelope<
	ServerMessageType.StyleGuideChange,
	Types.SerializedPatternLibrary
>;
export type Undo = EmptyEnvelope<ServerMessageType.Undo>;
