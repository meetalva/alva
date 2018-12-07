import * as Electron from 'electron';
import * as Server from '../server';
import * as Hosts from '../hosts';
import * as Types from '../types';
import * as Serde from '../sender/serde';
import { ElectronAdapter } from '../adapters/electron-adapter';
import * as Mobx from 'mobx';
import * as uuid from 'uuid';
import { MessageType as MT } from '../message';

const importFresh = require('import-fresh');
const clearModule = require('clear-module');
const serverPath = require.resolve('../server');

export interface ForcedFlags {
	port?: number;
}

export interface State {
	ready: boolean;
	fileToOpen?: string;
}

const state: State = Mobx.observable({
	ready: false,
	fileToOpen: undefined
});

const onOpenFile = (e, path) => {
	e.preventDefault();
	state.fileToOpen = path;
};

async function main(forced?: ForcedFlags): Promise<void> {
	Electron.app.on('will-finish-launching', () => {
		Electron.app.on('open-file', onOpenFile);
	});

	Electron.app.on('ready', () => {
		state.ready = true;
	});

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

	// Use process.argv[1] if passed for win32
	await Mobx.when(() => state.ready);
	const fileToOpen = state.fileToOpen || (await electronHost.getFlags())._[0];
	alvaServer.sender.send({
		type: MT.OpenFileRequest,
		id: uuid.v4(),
		payload: {
			path: fileToOpen,
			replace: false,
			silent: false
		}
	});

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

process.on('unhandledRejection', (p, err) => {
	if (err.hasOwnProperty('message')) {
		console.trace(err);
	}
});

main().catch(err => {
	process.nextTick(() => {
		throw err;
	});
});
