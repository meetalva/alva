import * as Http from 'http';
import * as Path from 'path';
import * as Hosts from '../../hosts';
import * as Serde from '../../sender/serde';
import * as Persistence from '../../persistence';
import * as Types from '../../types';
import { build } from './build';
import * as Fs from 'fs-extra';
import * as Model from '../../model';

const clearModule = require('clear-module');
const serveHandler = require('serve-handler');
const importFresh = require('import-fresh');
const buildPath = require.resolve('./build');

export interface ForcedFlags {
	port?: number;
}

async function main(forced?: ForcedFlags): Promise<void> {
	const nodeHost = await Hosts.NodeHost.fromProcess(process, forced);
	const flags = await nodeHost.getFlags();
	const port = await nodeHost.getPort(flags.port);

	const out = (flags as any).out;

	if (typeof out !== 'string') {
		throw new Error('--out is required to determin path to build to');
	}

	const path = Path.resolve(process.cwd(), out);

	if (flags.serve) {
		const server = Http.createServer((request, response) => {
			return serveHandler(request, response, {
				public: Path.resolve(process.cwd(), path),
				rewrites: [{ source: '**/*', destination: '/200.html' }]
			});
		});

		nodeHost.log(`Starting static server for ${path} on port ${port}...`);

		server.listen(port, () => {
			nodeHost.log(`Running at http://127.0.01:${port}`);
		});
	}

	const projectPath = flags.project ? Path.resolve(process.cwd(), flags.project) : undefined;
	const projectFile = projectPath ? String(await Fs.readFile(projectPath)) : undefined;
	const projectData = projectFile
		? await Persistence.Persistence.parse<Types.SerializedProject>(projectFile)
		: undefined;
	const projectResult = projectData ? Model.Project.fromResult(projectData) : undefined;

	if (projectResult && projectResult.status === Types.ProjectStatus.Error) {
		throw projectResult.error;
	}

	if (projectResult) {
		const p = projectResult.result;
		nodeHost.log(`Embedding ${p.getName()} at http://127.0.01:${port}/project/${p.getId()}`);
	}

	await build({ path, host: nodeHost, project: projectResult ? projectResult.result : undefined });

	const onRestart = async () => {
		const sourceDirectory = await nodeHost.resolveFrom(Types.HostBase.Source, '.');
		clearModule.match(new RegExp(`^${sourceDirectory}`));

		const freshBuild = importFresh(buildPath).build as typeof build;
		await freshBuild({ path, host: nodeHost });
	};

	const onMessage = (envelope: string) => {
		const message = Serde.deserialize(envelope);

		if (!message) {
			return;
		}

		if (message.type === 'reload') {
			onRestart();
		}
	};

	process.on('message', onMessage);

	if (!flags.serve) {
		process.exit();
	}
}

process.on('unhandledRejection', (p, error) => {
	console.trace(error);
});

main().catch(err => {
	setTimeout(() => {
		throw err;
	});
});
