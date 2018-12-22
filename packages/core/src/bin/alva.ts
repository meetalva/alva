#!/usr/bin/env node
import * as ChildProcess from 'child_process';
import * as uuid from 'uuid';
import * as Hosts from '../hosts';
import * as Message from '../message';
import * as Serde from '../sender/serde';

const yargsParser = require('yargs-parser');
const electron = (require('electron') as any) as string;

function sendTo(cp: ChildProcess.ChildProcess) {
	return (payload: Message.Message): void => {
		if (!cp || !cp.send || !cp.connected) {
			return;
		}
		cp.send(Serde.serialize(payload));
	};
}

async function main(): Promise<void> {
	const flags = yargsParser(process.argv.slice(2));
	const host = flags.host || 'electron';

	const spawn =
		host !== 'electron'
			? (e: string, a?: string[], o?: any) => ChildProcess.fork(entry, a, o)
			: (e: string, a?: string[], o?: any) =>
					ChildProcess.spawn(electron, [entry, ...(a || [])], o);

	const entry = getEntry(host);
	const cp = spawn(entry, process.argv.slice(2), { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] });
	const send = sendTo(cp);

	cp.stdout.pipe(process.stdout);
	cp.stderr.pipe(process.stderr);

	cp.on('exit', (code: number) => process.exit(code));
	cp.on('error', () => process.exit(1));

	process.on('exit', () => cp.kill());

	const restarter = await Hosts.RestartListener.fromProcess(process);

	restarter.subscribe(() => {
		send({ type: Message.MessageType.Reload, payload: undefined, id: uuid.v4() });
	});
}

function getEntry(host: string = 'electron'): string {
	switch (host) {
		case 'node':
		case 'static':
		case 'electron':
			return require.resolve(`./${host}`);
		default:
			throw new Error(`Unknown --host: ${host}`);
	}
}

process.on('unhandledRejection', (p, error) => {
	console.trace(error);
});

main().catch(err => {
	process.nextTick(() => {
		throw err;
	});
});
