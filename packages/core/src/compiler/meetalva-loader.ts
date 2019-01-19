export default function alvaEntryLoader() {
	const options = getOptions(this);
	const components = JSON.parse(options.components);

	return Object.keys(components)
		.map(name => createExport(name, components[name]))
		.join('\n');
}

function createExport(name, id) {
	return `module.exports[${JSON.stringify(name)}] = require(${JSON.stringify(id)})`;
}

function getOptions(loaderContext) {
	const query = loaderContext.query;

	if (typeof query === 'string' && query !== '') {
		return parseQuery(loaderContext.query);
	}

	if (!query || typeof query !== 'object') {
		// Not object-like queries are not supported.
		return null;
	}

	return query;
}

const specialValues = {
	null: null,
	true: true,
	false: false
};

function parseQuery(query) {
	if (query.substr(0, 1) !== '?') {
		throw new Error("A valid query string passed to parseQuery should begin with '?'");
	}

	query = query.substr(1);

	if (!query) {
		return {};
	}

	const queryArgs = query.split(/[,&]/g);
	const result = {};

	queryArgs.forEach(arg => {
		const idx = arg.indexOf('=');

		if (idx >= 0) {
			let name = arg.substr(0, idx);
			let value = decodeURIComponent(arg.substr(idx + 1));

			if (specialValues.hasOwnProperty(value)) {
				value = specialValues[value];
			}

			if (name.substr(-2) === '[]') {
				name = decodeURIComponent(name.substr(0, name.length - 2));

				if (!Array.isArray(result[name])) {
					result[name] = [];
				}

				result[name].push(value);
			} else {
				name = decodeURIComponent(name);
				result[name] = value;
			}
		} else {
			if (arg.substr(0, 1) === '-') {
				result[decodeURIComponent(arg.substr(1))] = false;
			} else if (arg.substr(0, 1) === '+') {
				result[decodeURIComponent(arg.substr(1))] = true;
			} else {
				result[decodeURIComponent(arg)] = true;
			}
		}
	});

	return result;
}
