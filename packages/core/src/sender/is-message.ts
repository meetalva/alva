import { Message } from '@meetalva/message';
import { isMessageType } from './is-message-type';

// tslint:disable-next-line:no-any
export function isMessage(input: any): input is Message {
	if (typeof input !== 'object') {
		return false;
	}

	const type = input.type;

	if (typeof type !== 'string' || typeof input.id !== 'string') {
		return false;
	}

	if (!isMessageType(type)) {
		return false;
	}

	return true;
}
