import * as Express from 'express';
import * as Types from '../../types';
import * as Path from 'path';

export function scriptsRouteFactory(server: Types.AlvaServer): Express.RequestHandler {
	return async function scriptsRoute(req: Express.Request, res: Express.Response): Promise<void> {
		const results = await Promise.all(
			[
				Path.resolve(__dirname, '..', 'scripts', req.params.path), //  built via ncc
				Path.resolve(__dirname, '..', '..', 'scripts', req.params.path) // other envs
			].map(async candidate => {
				try {
					return { error: null, file: await server.host.readFile(candidate) };
				} catch (error) {
					return { error, file: null };
				}
			})
		);

		const result = results.find(
			(r): r is { error: null; file: Types.HostFile } => r.error === null
		);

		if (result) {
			res.type('js');
			res.send(result.file.buffer);
			return;
		}

		server.host.log(results.map(r => r.error.message).join('\n'));

		if (results.every(r => r.error.code === 'ENOENT')) {
			res.sendStatus(404);
		} else {
			res.sendStatus(500);
		}
	};
}
