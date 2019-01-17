// tslint:disable:no-non-null-assertion
// tslint:disable:no-duplicate-imports
import * as express from 'express';
import * as Http from 'http';
import * as Util from 'util';
import * as WS from 'ws';
import * as uuid from 'uuid';
import * as Routes from './routes';
import * as Sender from '../sender';
import * as Types from '../types';
import bodyParser = require('body-parser');
import { MessageType } from '../message';

const csp = require('helmet-csp');

interface AlvaServerInit {
	app: express.Express;
	host: Types.Host;
	interface?: string;
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
	public sender: Sender.Sender;
	public readonly port: number;
	public readonly interface?: string;

	public get address(): string {
		return `http://127.0.0.1:${this.port}/`;
	}

	public get endpoint(): string {
		return `ws://127.0.0.1:${this.port}/`;
	}

	public get location(): Types.Location {
		const port = typeof this.port !== 'undefined' && this.port !== 80 ? `:${this.port}` : '';
		const stringPort = typeof this.port !== 'undefined' ? String(this.port) : '80';

		return {
			hash: '',
			host: `127.0.0.1${port}`,
			hostname: '127.0.0.1',
			href: `http://127.0.0.1${port}`,
			origin: `http://127.0.0.1${port}`,
			pathname: '/',
			port: stringPort,
			protocol: 'http:',
			search: ''
		};
	}

	private constructor(init: AlvaServerInit) {
		this.app = init.app;
		this.http = init.http;
		this.ws = init.ws;
		this.port = init.options.port;
		this.interface = init.interface;

		this.sender = new Sender.Sender({
			autostart: false,
			endpoint: this.endpoint
		});
		init.host.setSender(this.sender);

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
			this.host.log(e);
		});

		this.app.use(
			bodyParser.json({
				type: ['json', 'application/csp-report']
			})
		);

		this.app.post('/csp-report', (req, res) => {
			if (req.body) {
				this.sender.send({
					type: MessageType.CspReport,
					id: uuid.v4(),
					payload: req.body['csp-report']
				});
			}
			res.status(204).end();
		});

		this.app
			.use((_, res, next) => {
				res.locals.nonce = uuid.v4();
				next();
			})
			.use((req, res, next) => {
				this.host.log('↥', req.method, req.url);

				res.on('finish', () => {
					this.host.log('↧', res.statusCode, req.url);
				});
				next();
			})
			.use(
				csp({
					directives: {
						defaultSrc: [this.address, (_, res) => `'nonce-${res.locals.nonce}'`],
						scriptSrc: [this.address, "'unsafe-inline'"],
						styleSrc: ["'unsafe-inline'"],
						connectSrc: [this.endpoint],
						reportUri: '/csp-report'
					},
					setAllHeaders: true,
					browserSniff: false
				})
			);

		/** Splash view, recent project list */
		this.app.get('/', Routes.mainRouteFactory(this));

		/** For debugging */
		this.app.get('/echo/:message', (req, res) => res.send(req.params.message));

		/** Project edit view */
		this.app.get('/project/:id', Routes.projectRouteFactory(this));

		/** Project export */
		this.app.get('/project/export/:id', Routes.exportRouteFactory(this));

		/** Scripts required for client side application */
		this.app.get('/scripts/:path', Routes.scriptsRouteFactory(this));
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

		const serverInterface = flags.localhost !== false ? '127.0.0.1' : undefined;

		return new AlvaServer({
			app,
			host,
			interface: serverInterface,
			dataHost,
			http,
			ws,
			options: { port }
		});
	}

	public async start(): Promise<void> {
		const listen = Util.promisify(this.http.listen.bind(this.http));
		const interfaces = this.interface ? `${this.interface} interface` : 'all interfaces';

		this.host.log(`Starting Alva server on port ${this.port} and ${interfaces}...`);
		await listen(this.port);

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
