import { ServerMessage, ServerMessageType } from '.';

const TYPES = Object.values(ServerMessageType);

// tslint:disable-next-line:no-any
export function isMessage(input: any): input is ServerMessage {
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
