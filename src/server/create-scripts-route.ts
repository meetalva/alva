import * as Express from 'express';
import * as Fs from 'fs';
import * as Path from 'path';

export function createScriptsRoute(): Express.RequestHandler {
	return function scriptsRoute(req: Express.Request, res: Express.Response): void {
		const candidate = Path.join(__dirname, '..', 'scripts', req.path.slice(1));

		if (Fs.existsSync(candidate)) {
			res.type('js');
			Fs.createReadStream(candidate).pipe(res);
			return;
		}
	};
}
