import * as Http from 'http';
import * as Path from 'path';
import * as Hosts from '../../hosts';
import * as Serde from '../../sender/serde';
import * as Types from '../../types';
import { build } from './build';

const clearModule = require('clear-module');
const serveHandler = require('serve-handler');
const importFresh = require('import-fresh');
const buildPath = require.resolve('./build');

export interface ForcedFlags {
	port?: number;
}

async function main(forced?: ForcedFlags): Promise<void> {
	const nodeHost = await Hosts.NodeHost.fromProcess(process, forced);
	const flags = await nodeHost.getFlags();
	const port = await nodeHost.getPort(flags.port);
	const path = Path.resolve(process.cwd(), flags._[0] || process.cwd());

	if (flags.serve) {
		const server = Http.createServer((request, response) => {
			return serveHandler(request, response, {
				public: Path.resolve(process.cwd(), path),
				rewrites: [
					{ source: 'preview/*', destination: '/preview/index.html' },
					{ source: 'project/*', destination: '/project/index.html' }
				]
			});
		});

		console.log(`Starting static server for ${path} on port ${port}...`);

		server.listen(port, () => {
			console.log(`Running at http://localhost:${port}`);
		});
	}

	await build({ path, host: nodeHost });

	const onRestart = async () => {
		const sourceDirectory = await nodeHost.resolveFrom(Types.HostBase.Source, '.');
		clearModule.match(new RegExp(`^${sourceDirectory}`));

		const freshBuild = importFresh(buildPath).build as typeof build;
		await freshBuild({ path, host: nodeHost });
	};

	const onMessage = envelope => {
		const message = Serde.deserialize(envelope);

		if (!message) {
			return;
		}

		if (message.type === 'reload') {
			onRestart();
		}
	};

	process.on('message', onMessage);

	if (!flags.serve) {
		process.exit();
	}
}

process.on('unhandledRejection', (p, error) => {
	console.trace(error);
});

main().catch(err => {
	throw err;
});
