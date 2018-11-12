// tslint:disable:no-non-null-assertion
// tslint:disable:no-duplicate-imports
import * as express from 'express';
import * as Http from 'http';
import * as Util from 'util';
import * as WS from 'ws';
import * as Routes from './routes';
import * as Sender from '../sender';
import { MessageType as M } from '../message';
import * as Matchers from './matchers';
import * as Types from '../types';

interface AlvaServerInit {
	app: express.Express;
	host: Types.Host;
	dataHost: Types.DataHost;
	http: Http.Server;
	ws: WS.Server;
	options: {
		port: number;
	};
}

export class AlvaServer implements Types.AlvaServer {
	private app: express.Express;
	private http: Http.Server;
	private ws: WS.Server;
	public readonly dataHost: Types.DataHost;
	public readonly host: Types.Host;
	public readonly sender: Sender.Sender;
	public readonly port: number;

	public get address(): string {
		return `http://localhost:${this.port}/`;
	}

	public get endpoint(): string {
		return `ws://localhost:${this.port}/`;
	}

	private constructor(init: AlvaServerInit) {
		this.app = init.app;
		this.http = init.http;
		this.ws = init.ws;
		this.port = init.options.port;

		this.sender = new Sender.Sender({
			autostart: false,
			endpoint: this.endpoint
		});

		this.host = init.host;
		this.dataHost = init.dataHost;

		this.ws.on('connection', connection => {
			connection.on('message', envelope => {
				this.ws.clients.forEach(client => {
					if (client !== connection && client.readyState === WS.OPEN) {
						client.send(envelope);
					}
				});
			});
		});

		this.ws.on('error', e => {
			console.log(e);
		});

		/** Splash view, recent project list */
		this.app.get('/', Routes.mainRouteFactory(this));

		/** Project preview view */
		this.app.get('/preview/:id', Routes.previewRouteFactory(this));

		/** Project edit view */
		this.app.get('/project/:id', Routes.projectRouteFactory(this));

		/** Scripts required for client side application */
		this.app.get('/scripts/*', Routes.scriptsRouteFactory(this));

		this.sender.match(M.ConnectPatternLibraryRequest, Matchers.connectPatternLibrary(this));
		this.sender.match(M.CreateNewFileRequest, Matchers.createNewFileRequest(this));
		this.sender.match(M.OpenExternalURL, Matchers.openExternalUrl(this));
		this.sender.match(M.OpenFileRequest, Matchers.openFileRequest(this));
		this.sender.match(M.ShowMessage, Matchers.showMessage(this));
		this.sender.match(M.UseFileRequest, Matchers.useFileRequest(this));
	}

	public static async fromHosts({
		host,
		dataHost
	}: {
		host: Types.Host;
		dataHost: Types.DataHost;
	}): Promise<AlvaServer> {
		const flags = await host.getFlags();
		const port = await host.getPort(flags.port);

		const app = express();
		const http = Http.createServer(app);
		const ws = new WS.Server({ server: http });

		return new AlvaServer({
			app,
			host,
			dataHost,
			http,
			ws,
			options: { port }
		});
	}

	public async start(): Promise<void> {
		const listen = Util.promisify(this.http.listen.bind(this.http));

		this.host.log(`Starting Alva server on port ${this.port}..`);
		await listen(this.port, 'localhost');

		await this.sender.start();
		this.host.log(`Started Alva server on ${this.address}.`);
	}

	public stop(): Promise<void> {
		this.host.log(`Stopping Alva server on ${this.address}.`);

		this.sender.stop();

		return new Promise(resolve =>
			this.ws.close(() => {
				this.http.close(() => {
					this.host.log(`Stopped Alva server on ${this.address}.`);
					resolve();
				});
			})
		);
	}
}
