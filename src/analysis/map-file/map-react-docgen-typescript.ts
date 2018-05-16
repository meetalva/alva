import * as T from '../types';

import * as reactDocgenTypescript from 'react-docgen-typescript';

const label = 'react-docgen-typescript';

export const mapReactDocgenTypeScript: T.AnalysisMapper = async (
	path: string,
	ctx: T.AnalysisMapperContext
): Promise<void> => {
	try {
		const info = reactDocgenTypescript.parse(path);
		if (info.length > 0) {
			ctx.analysis.attach(path, { type: label, payload: info });
		}
		// tslint:disable-next-line:no-empty
	} catch (err) {}
};
