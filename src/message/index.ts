export enum PreviewMessageType {
	ContentRequest = 'content-request',
	ContentResponse = 'content-response',
	ElementChange = 'element-change',
	OpenPage = 'open-page',
	Reload = 'reload',
	SetVariable = 'set-variable',
	SketchExportRequest = 'sketch-export-request',
	SketchExportResponse = 'sketch-export-response',
	State = 'state',
	Update = 'update'
}

export enum ServerMessageType {
	AppLoaded = 'app-loaded',
	BundleChange = 'bundle-change',
	ContentRequest = 'content-request',
	ContentResponse = 'content-response',
	ElementChange = 'element-change',
	OpenPage = 'open-page',
	PageChange = 'page-change',
	SetVariable = 'set-variable',
	SketchExportRequest = 'sketch-export-request',
	SketchExportResponse = 'sketch-export-response',
	StartApp = 'start-app',
	StyleGuideChange = 'styleguide-change'
}

export interface Envelope<V, T> {
	id: string;
	payload: T;
	type: V;
}

export type ServerMessage =
	| ContentRequest
	| ContentResponse
	| OpenPageMessage
	| SetVariableMessage
	| SketchExportRequest
	| SketchExportResponse
	| StartAppMessage;

export type ContentRequest = Envelope<ServerMessageType.ContentRequest, undefined>;
export type ContentResponse = Envelope<ServerMessageType.ContentResponse, string>;
export type OpenPageMessage = Envelope<ServerMessageType.OpenPage, string>;
export type SetVariableMessage = Envelope<
	ServerMessageType.SetVariable,
	{ inputValue: string; variable: string }
>;
export type SketchExportRequest = Envelope<ServerMessageType.SketchExportRequest, undefined>;
export type SketchExportResponse = Envelope<ServerMessageType.SketchExportResponse, string>;
export type StartAppMessage = Envelope<ServerMessageType.StartApp, string>;
