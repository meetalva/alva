#!/usr/bin/env node
import * as ChildProcess from 'child_process';
import * as uuid from 'uuid';
import * as Hosts from '../hosts';
import * as Message from '../message';
import * as Serde from '../sender/serde';

const yargsParser = require('yargs-parser');
const electron = (require('electron') as any) as string;
const electronEntry = require.resolve('./electron');
const nodeEntry = require.resolve('./node');

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

	const spawn =
		flags.host === 'node'
			? ChildProcess.fork
			: (entry, args, opts) => ChildProcess.spawn(electron, [entry, ...args], opts);
	const entry = flags.host === 'node' ? nodeEntry : electronEntry;
	const cp = spawn(entry, process.argv.slice(2), { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] });
	const send = sendTo(cp);

	cp.stdout.pipe(process.stdout);
	cp.stderr.pipe(process.stderr);

	cp.on('exit', code => process.exit(code));
	process.on('exit', () => cp.kill());

	const restarter = await Hosts.RestartListener.fromProcess(process);

	restarter.subscribe(() => {
		send({ type: Message.MessageType.Reload, payload: undefined, id: uuid.v4() });
	});
}

process.on('unhandledRejection', (p, error) => {
	console.trace(error);
});

main().catch(err => {
	throw err;
});
