import * as Server from '../server';
import * as Hosts from '../hosts';
import * as Types from '../types';
import * as Serde from '../sender/serde';

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

	await alvaServer.start();

	const onRestart = async () => {
		const port = alvaServer.port;
		await alvaServer.stop();

		const sourceDirectory = await nodeHost.resolveFrom(Types.HostBase.Source, '.');
		clearModule.match(new RegExp(`^${sourceDirectory}`));

		await main({ port });
	};

	const onMessage = envelope => {
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

main().catch(err => {
	throw err;
});
