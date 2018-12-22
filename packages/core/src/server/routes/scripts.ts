import * as Express from 'express';
import * as Fs from 'fs';
import * as Types from '../../types';

export function scriptsRouteFactory(server: Types.AlvaServer): Express.RequestHandler {
	return async function scriptsRoute(req: Express.Request, res: Express.Response): Promise<void> {
		const candidate = await server.host.resolveFrom(
			Types.HostBase.Source,
			'scripts',
			req.params.path
		);

		try {
			const file = await server.host.readFile(candidate);
			res.type('js').send(file.contents);
		} catch (err) {
			server.host.log(err);

			switch (err.code) {
				case 'ENOENT': {
					res.sendStatus(404);
					break;
				}
				default:
					res.sendStatus(500);
			}
		}
	};
}
