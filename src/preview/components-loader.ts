import { getOptions } from 'loader-utils';
import { loader } from 'webpack';

// No typings available for commondir
const commondir = require('commondir');

module.exports = alvaEntryLoader;

interface StringMap {
	[name: string]: string;
}

export function alvaEntryLoader(this: loader.LoaderContext): string {
	const options = getOptions(this);
	const components: StringMap = JSON.parse(options.components);
	const common = commondir(options.cwd, Object.values(components));

	this.addContextDependency(common);

	return Object.entries(components)
		.map(([name, id]) => createExport(name, id))
		.join('\n');
}

function createExport(name: string, id: string): string {
	return `module.exports[${JSON.stringify(name)}] = require(${JSON.stringify(id)})`;
}
