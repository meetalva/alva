import * as Server from '../server';
import * as Hosts from '../hosts';
import * as Types from '../types';
import * as Serde from '../sender/serde';
import { ElectronAdapter } from '../adapters/electron-adapter';

const importFresh = require('import-fresh');
const clearModule = require('clear-module');
const serverPath = require.resolve('../server');

export interface ForcedFlags {
	port?: number;
}

async function main(forced?: ForcedFlags): Promise<void> {
	const AlvaServer = importFresh(serverPath).AlvaServer as typeof Server.AlvaServer;

	const electronHost = await Hosts.ElectronHost.from({
		process,
		forced
	});

	const localDataHost = await Hosts.LocalDataHost.fromHost(electronHost);

	const alvaServer = await AlvaServer.fromHosts({
		host: electronHost,
		dataHost: localDataHost
	});

	const adapter = new ElectronAdapter({ server: alvaServer });

	await alvaServer.start();
	await adapter.start();

	const onRestart = async () => {
		const port = alvaServer.port;
		await alvaServer.stop();

		const sourceDirectory = await electronHost.resolveFrom(Types.HostBase.Source, '.');
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

process.on('unhandledRejection', (p, error) => {
	console.trace(error);
	console.log(JSON.stringify(error));
});

main().catch(err => {
	process.nextTick(() => {
		throw err;
	});
});
