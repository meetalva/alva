import * as Ephemeral from './ephemeral-store';
import * as Events from 'events';
import * as Message from '../message';
import * as Model from '../model';
import { Sender } from '../sender/server';
import { AlvaWindow } from './alva-window';

import { createAppMessageHandler } from './create-app-message-handler';
import { createEditMessageHandler } from './create-edit-message-handler';
import { createExportMessageHandler } from './create-export-message-handler';
import { createFileMessageHandler } from './create-file-message-handler';
import { createLibraryMessageHandler } from './create-library-message-handler';

export interface ServerMessageHandlerContext {
	app: undefined | Model.AlvaApp;
	appPath: string;
	port: undefined | number;
	projects: Map<string, Model.Project>;
	windows: Map<string, AlvaWindow>;
}

export interface ServerMessageHandlerInjection {
	emitter: Events.EventEmitter;
	ephemeralStore: Ephemeral.EphemeralStore;
	sender: Sender;
	server: Events.EventEmitter;
}

export async function createServerMessageHandler(
	ctx: ServerMessageHandlerContext,
	injection: ServerMessageHandlerInjection
): Promise<(message: Message.Message) => Promise<void>> {
	const appMessageHandler = await createAppMessageHandler(ctx, injection);
	const editMessageHandler = await createEditMessageHandler(ctx, injection);
	const exportMessageHandler = await createExportMessageHandler(ctx, injection);
	const fileMessageHandler = await createFileMessageHandler(ctx, injection);
	const libraryMessageHandler = await createLibraryMessageHandler(ctx, injection);

	return async function serverMessageHandler(message: Message.Message): Promise<void> {
		injection.server.emit('message', message);
		appMessageHandler(message);
		editMessageHandler(message);
		exportMessageHandler(message);
		fileMessageHandler(message);
		libraryMessageHandler(message);
	};
}
