import * as AlvaUtil from '../alva-util';
import * as Electron from 'electron';
import * as Message from '../message';
import { isMessage } from '../sender/is-message';
import * as uuid from 'uuid';

export function setClipboard(payload: Message.Clipboard['payload']): void {
	Electron.clipboard.writeBuffer(
		'application/alva',
		Buffer.from(
			JSON.stringify({
				type: Message.MessageType.Clipboard,
				id: uuid.v4(),
				payload
			})
		)
	);
}

export function getClipboard(): Message.Clipboard | undefined {
	const rawData = Electron.clipboard.readBuffer('application/alva').toString();

	if (!rawData) {
		return;
	}

	const parseResult = AlvaUtil.parseJSON(rawData);

	if (parseResult.type === AlvaUtil.ParseResultType.Error) {
		console.error(parseResult.error);
		return;
	}

	if (!isMessage(parseResult.result)) {
		console.error(`Received malformed clipboard message: ${parseResult.data}`);
		return;
	}

	if (parseResult.result.type !== Message.MessageType.Clipboard) {
		return;
	}

	return parseResult.result as Message.Clipboard;
}
