import * as Sentry from '@sentry/node';

Sentry.init({
	dsn: 'https://32e87a490c1d47d4af05741996b8c5fa@sentry.io/1360222'
});

import * as Server from '../server';
import * as Hosts from '../hosts';
import * as Types from '../types';
import * as Serde from '../sender/serde';
import { NodeAdapter } from '../adapters/node-adapter';

const importFresh = require('import-fresh');
const clearModule = require('clear-module');
const serverPath = require.resolve('../server');

export interface ForcedFlags {
	port?: number;
}

async function main(forced?: ForcedFlags): Promise<void> {
	const AlvaServer = importFresh(serverPath).AlvaServer as typeof Server.AlvaServer;

	const nodeHost = await Hosts.NodeHost.fromProcess(process, forced);
	const localDataHost = await Hosts.LocalDataHost.fromHost(nodeHost);

	const alvaServer = await AlvaServer.fromHosts({
		host: nodeHost,
		dataHost: localDataHost
	});

	const adapter = new NodeAdapter({ server: alvaServer });

	await alvaServer.start();
	await adapter.start();

	const onRestart = async () => {
		const port = alvaServer.port;
		await alvaServer.stop();

		const sourceDirectory = await nodeHost.resolveFrom(Types.HostBase.Source, '..');
		clearModule.match(new RegExp(`^${sourceDirectory}`));

		await main({ port });
	};

	const onMessage = (envelope: string) => {
		const message = Serde.deserialize(envelope);

		if (!message) {
			return;
		}

		if (message.type === 'reload') {
			onRestart();
			process.removeListener('message' as any, onMessage);
		}
	};

	process.on('message', onMessage);
}

process.on('unhandledRejection', (p, error) => {
	console.trace(error);
});

main().catch(err => {
	process.nextTick(() => {
		throw err;
	});
});
