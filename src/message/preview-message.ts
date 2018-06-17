import { Envelope, EmptyEnvelope } from './envelope';

export enum PreviewMessageType {
	ActivatePage = 'activate-page',
	ClickElement = 'click-element',
	ContentResponse = 'content-response',
	HighlightElement = 'highlight-element',
	KeyboardChange = 'keyboard-change',
	Reload = 'reload',
	SelectElement = 'select-element',
	SketchExportRequest = 'sketch-export-request',
	SketchExportResponse = 'sketch-export-response',
	State = 'state',
	UnselectElement = 'unselect-element',
	UnHighlightElement = 'unhighlight-element'
}

export type PreviewMessage =
	| PreviewActivatePage
	| PreviewHighlightElement
	| PreviewSelectElement
	| PreviewClickElement
	| PreviewContentResponse
	| PreviewSelectElement
	| PreviewSketchExportResponse
	| PreviewUnselectElement
	| PreviewUnHighlightElement
	| PreviewKeyboardChange;

export type PreviewActivatePage = Envelope<PreviewMessageType.ActivatePage, { id: string }>;
export type PreviewClickElement = Envelope<PreviewMessageType.ClickElement, { id: string }>;
export type PreviewContentResponse = Envelope<PreviewMessageType.ContentResponse, string>;
export type PreviewHighlightElement = Envelope<PreviewMessageType.HighlightElement, { id: string }>;
export type PreviewSelectElement = Envelope<PreviewMessageType.SelectElement, { id: string }>;
export type PreviewSketchExportResponse = Envelope<PreviewMessageType.SketchExportResponse, string>;
export type PreviewUnselectElement = EmptyEnvelope<PreviewMessageType.UnselectElement>;
export type PreviewKeyboardChange = Envelope<
	PreviewMessageType.KeyboardChange,
	{ metaDown: boolean }
>;
export type PreviewUnHighlightElement = EmptyEnvelope<PreviewMessageType.UnHighlightElement>;
