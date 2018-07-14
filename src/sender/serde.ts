import * as AlvaUtil from '../alva-util';
import * as _ from 'lodash';
import { isMessage } from './is-message';
import * as Message from '../message';

const TYPES = Object.values(Message.MessageType);
const OVERTURE_LENGTH = 8;

export enum TechnicalMessageType {
	Unknown = 'unknown',
	Invalid = 'invalid'
}

export enum MessageHeaderStatus {
	Ok = 'ok',
	Error = 'error'
}

export interface MessageHeader {
	type: Message.MessageType | TechnicalMessageType;
	status: MessageHeaderStatus;
}

export function serialize(message: Message.Message): string {
	const headerData = JSON.stringify({ type: message.type });
	const headerLength = headerData.length.toString();

	if (headerLength.length > OVERTURE_LENGTH) {
		throw new Error(
			`Could not serialize ${message}, header size exceeds max length of 8 digits with ${headerLength}`
		);
	}

	const length = _.padStart(headerLength, OVERTURE_LENGTH, '0');
	return [length, headerData, JSON.stringify(message)].join('');
}

export function deserialize(data: string): Message.Message | undefined {
	const messageHeader = getMessageHeader(data);

	if (messageHeader.status === MessageHeaderStatus.Error) {
		return;
	}

	const messageBody = getMessageBody(data);

	if (typeof messageBody === 'undefined') {
		return;
	}

	const parsed = AlvaUtil.parseJSON(messageBody);

	if (parsed.type === AlvaUtil.ParseResultType.Error) {
		return;
	}

	if (!isMessage(parsed.result)) {
		return;
	}

	return parsed.result;
}

export function getMessageBody(data: string): string | undefined {
	const headerLength = getMessageHeaderLength(data);

	if (typeof headerLength === 'undefined') {
		return;
	}

	return data.slice(OVERTURE_LENGTH + headerLength);
}

export function getMessageHeader(data: string): MessageHeader {
	const headerLength = getMessageHeaderLength(data);

	if (typeof headerLength === 'undefined') {
		return { type: TechnicalMessageType.Invalid, status: MessageHeaderStatus.Error };
	}

	// tslint:disable-next-line:no-any
	const headerParseResult = AlvaUtil.parseJSON<any>(
		data.slice(OVERTURE_LENGTH, OVERTURE_LENGTH + headerLength)
	);

	if (headerParseResult.type !== AlvaUtil.ParseResultType.Success) {
		return { type: TechnicalMessageType.Invalid, status: MessageHeaderStatus.Error };
	}

	if (
		typeof headerParseResult.result !== 'object' ||
		typeof headerParseResult.result.type !== 'string'
	) {
		return { type: TechnicalMessageType.Invalid, status: MessageHeaderStatus.Error };
	}

	if (!TYPES.includes(headerParseResult.result.type)) {
		return { type: TechnicalMessageType.Unknown, status: MessageHeaderStatus.Error };
	}

	return { type: headerParseResult.result.type, status: MessageHeaderStatus.Ok };
}

export function getMessageHeaderLength(data: string): number | undefined {
	const headerLength = parseInt(data.slice(0, 8), 10);

	if (Number.isNaN(headerLength)) {
		return undefined;
	}

	return headerLength;
}
