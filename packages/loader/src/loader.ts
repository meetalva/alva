import { getOptions } from 'loader-utils';
import { loader } from 'webpack';
import * as _ from 'lodash';

// No typings available for commondir
const commondir = require('commondir');

interface StringMap {
	[name: string]: string;
}

export default function alvaEntryLoader(this: loader.LoaderContext): string {
	// tslint:disable-next-line:no-any
	const options = getOptions(this as any);

	const components: StringMap = JSON.parse(options.components);
	const componentDirs = _.values(components);

	if (componentDirs.length > 0) {
		this.addContextDependency(commondir(options.cwd, componentDirs));
	}

	return _.entries(components)
		.map(([name, id]) => createExport(name, id))
		.join('\n');
}

function createExport(name: string, id: string): string {
	return `module.exports[${JSON.stringify(name)}] = require(${JSON.stringify(id)})`;
}
