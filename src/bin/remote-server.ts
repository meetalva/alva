#!/usr/bin/env node
import * as Server from '../server';
import * as Hosts from '../hosts';
import * as Types from '../types';

const importFresh = require('import-fresh');
const clearModule = require('clear-module');
const serverPath = require.resolve('../server');

export interface ForcedFlags {
	port?: number;
}

async function main(forced?: ForcedFlags): Promise<void> {
	const AlvaServer = importFresh(serverPath).AlvaServer as typeof Server.AlvaServer;

	const nodeHost = await Hosts.RemoteNodeHost.fromProcess(process, forced);
	const localDataHost = await Hosts.LocalDataHost.fromHost(nodeHost);

	const alvaServer = await AlvaServer.fromHosts({
		host: nodeHost,
		dataHost: localDataHost
	});

	await alvaServer.start();

	const restarter = await Hosts.RestartListener.fromProcess(process);

	const onRestart = async () => {
		const port = alvaServer.port;
		await alvaServer.stop();

		const sourceDirectory = await nodeHost.resolveFrom(Types.HostBase.Source, '.');
		clearModule.match(new RegExp(`^${sourceDirectory}`));

		restarter.unsubscribe();
		await main({ port });
	};

	restarter.subscribe(onRestart);
}

main().catch(err => {
	throw err;
});
