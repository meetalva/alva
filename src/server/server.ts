import { createConnectionHandler } from './create-connection-handler';
import { createLibrariesRoute } from './create-libraries-route';
import { createPreviewRoute } from './create-preview-route';
import { createScriptsRoute } from './create-scripts-route';
import { createServerMessageHandler } from './create-server-message-handler';
import { EventEmitter } from 'events';
import * as express from 'express';
import * as Http from 'http';
import * as WS from 'ws';
import { Sender } from '../sender/server';

export interface ServerOptions {
	port: number;
	sender: Sender;
}

export function createServer(options: ServerOptions): Promise<EventEmitter> {
	return new Promise((resolve, reject) => {
		const emitter = new EventEmitter();
		const app = express();

		const server = Http.createServer(app);
		const webSocketServer = new WS.Server({ server });

		webSocketServer.on('connection', createConnectionHandler({ emitter }));
		app.get('/preview.html', createPreviewRoute({ sender: options.sender }));
		app.use('/scripts', createScriptsRoute());
		app.use('/libraries', createLibrariesRoute({ sender: options.sender }));

		emitter.on('message', createServerMessageHandler({ webSocketServer }));

		server.once('error', reject);
		server.listen(options.port, () => resolve(emitter));
	});
}
