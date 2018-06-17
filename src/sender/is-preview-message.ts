import { PreviewMessage, PreviewMessageType } from '../message';

const TYPES = Object.values(PreviewMessageType);

// tslint:disable-next-line:no-any
export function isPreviewMessage(input: any): input is PreviewMessage {
	if (typeof input !== 'object') {
		return false;
	}

	const type = input.type;

	if (typeof type !== 'string' || typeof input.id !== 'string') {
		return false;
	}

	if (!TYPES.includes(type)) {
		return false;
	}

	return true;
}
