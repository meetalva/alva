import * as T from '../types';
import * as Util from 'util';

const reactDocgen = require('react-docgen');

const label = 'react-docgen';

export const mapReactDocgen: T.AnalysisMapper = async (
	path: string,
	ctx: T.AnalysisMapperContext
): Promise<void> => {
	const readFile = Util.promisify(ctx.fs.readFile).bind(ctx.fs);

	try {
		const content = await readFile(path);
		const info = reactDocgen.parse(content);
		ctx.analysis.attach(path, { type: label, payload: info });
		// tslint:disable-next-line:no-empty
	} catch (err) {}
};
