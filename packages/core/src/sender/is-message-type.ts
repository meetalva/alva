import { MessageType } from '@meetalva/message';

export function isMessageType(candidate: unknown): candidate is MessageType {
	return Object.values(MessageType).includes(candidate);
}
