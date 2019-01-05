import * as Electron from 'electron';
import * as Hosts from '../hosts';
import { ElectronAdapter } from '../adapters/electron-adapter';
import { AlvaServer } from '../server';
import * as isDev from 'electron-is-dev';

const yargsParser = require('yargs-parser');

export interface ForcedFlags {
	port?: number;
}

async function main(forced?: ForcedFlags): Promise<void> {
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

	const forceUpdates = (await electronHost.getFlags()).forceUpdates === true;
	const adapter = new ElectronAdapter({ server: alvaServer, forceUpdates });

	electronHost.log(
		`Starting ${filePath ? 'with' : 'without'} file ${filePath ? `at ${filePath}` : ''}`
	);

	await alvaServer.start();
	await adapter.start({ filePath });
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
	if (isDev) {
		return undefined;
	}

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
