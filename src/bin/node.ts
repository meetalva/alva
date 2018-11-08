#!/usr/bin/env node
import * as Server from '../server';
import * as Hosts from '../hosts';
import * as Types from '../types';

const importFresh = require('import-fresh');
const clearModule = require('clear-module');
const serverPath = require.resolve('../server');

async function main(): Promise<void> {
	const AlvaServer = importFresh(serverPath).AlvaServer as typeof Server.AlvaServer;

	const nodeHost = await Hosts.NodeHost.fromProcess(process);
	const localDataHost = await Hosts.LocalDataHost.fromHost(nodeHost);

	const alvaServer = await AlvaServer.fromHosts({
		host: nodeHost,
		dataHost: localDataHost
	});

	await alvaServer.start();

	const restarter = await Hosts.RestartListener.fromProcess(process);

	const onRestart = async () => {
		await alvaServer.stop();

		const sourceDirectory = await nodeHost.resolveFrom(Types.HostBase.Source, '.');
		clearModule.match(new RegExp(`^${sourceDirectory}`));

		restarter.unsubscribe();
		await main();
	};

	restarter.subscribe(onRestart);
}

main().catch(err => {
	throw err;
});
