import { MessageType } from '../message';

export function isMessageType(candidate: unknown): candidate is MessageType {
	return Object.values(MessageType).includes(candidate);
}
