import * as Electron from 'electron';
import * as Server from '../server';
import * as Hosts from '../hosts';
import * as Types from '../types';
import * as Serde from '../sender/serde';
import { ElectronAdapter } from '../adapters/electron-adapter';

const importFresh = require('import-fresh');
const clearModule = require('clear-module');
const yargsParser = require('yargs-parser');
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

	// Determine file to open
	// Use process.argv[1] if passed for win32
	const filePath = (await getPassedFile()) || getFileFromProcess();

	const localDataHost = await Hosts.LocalDataHost.fromHost(electronHost);

	const alvaServer = await AlvaServer.fromHosts({
		host: electronHost,
		dataHost: localDataHost
	});

	const adapter = new ElectronAdapter({ server: alvaServer });

	electronHost.log(
		`Starting ${filePath ? 'with' : 'without'} file ${filePath ? `at ${filePath}` : ''}`
	);

	await alvaServer.start();
	await adapter.start({ filePath });

	const onRestart = async () => {
		const port = alvaServer.port;
		await alvaServer.stop();

		const sourceDirectory = await electronHost.resolveFrom(Types.HostBase.Source, '.');
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

function getPassedFile(): Promise<string | undefined> {
	return new Promise(resolve => {
		let passedFile: string;

		Electron.app.once('will-finish-launching', () => {
			Electron.app.on('open-file', (e, path) => {
				e.preventDefault();
				passedFile = path;
			});
		});

		Electron.app.once('ready', () => {
			resolve(passedFile);
		});
	});
}

function getFileFromProcess(): string | undefined {
	const { _: args } = yargsParser(process.argv);
	const lastArgument = args[args.length - 1];
	return args.length > 1 && lastArgument !== __filename ? lastArgument : undefined;
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
