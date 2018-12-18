import { getOptions } from 'loader-utils';
import { loader } from 'webpack';

// No typings available for commondir
const commondir = require('commondir');

module.exports = alvaEntryLoader;

interface StringMap {
	[name: string]: string;
}

export function alvaEntryLoader(this: loader.LoaderContext): string {
	// tslint:disable-next-line:no-any
	const options = getOptions(this as any);

	const components: StringMap = JSON.parse(options.components);
	const componentDirs = Object.values(components);

	if (componentDirs.length > 0) {
		this.addContextDependency(commondir(options.cwd, componentDirs));
	}

	return Object.entries(components)
		.map(([name, id]) => createExport(name, id))
		.join('\n');
}

function createExport(name: string, id: string): string {
	return `module.exports[${JSON.stringify(name)}] = require(${JSON.stringify(id)})`;
}
