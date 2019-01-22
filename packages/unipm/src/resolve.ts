import * as semver from 'semver';
import * as T from './types';
import { ParsedPackageName, parseName } from './parse-name';

const throat = require('throat');

export interface ResolvedPackage {
	packageName: ParsedPackageName;
	version: string;
	packument: any;
	dependencies: any[];
	parents: string[];
}

export interface ResolveOptions {
	fetch: T.Fetch;
	by?: { [key: string]: string };
	cache?: Map<string, any>;
	parents?: string[];
}

export async function resolve(input: string, options: ResolveOptions): Promise<ResolvedPackage> {
	const packageName = parseName(input);
	const cache = options.cache || new Map();

	const url = `https://registry.npmjs.cf/${packageName.full}`;
	const data = await getData(url, { fetch: options.fetch, cache });

	const versions = Object.keys(data.versions);
	const version = matchRange(packageName.versionRange, data);

	if (!version) {
		throw new Error(
			`No matching version "${
				packageName.versionRange
			}" for "${input}" found. Available versions: ${versions.join(', ')}`
		);
	}

	const packument = data.versions[version];
	const parents = options.parents || [];
	const history = [...parents, packument.name];

	const dependencies = await Promise.all(
		Object.entries(packument.dependencies || {})
			.filter(([name]) => !history.includes(name))
			.map(
				throat(5, ([name, version]) =>
					resolve(`${name}@${version}`, { ...options, cache, parents: history })
				)
			)
	);

	return {
		packageName,
		version,
		packument,
		dependencies,
		parents
	};
}

interface PackageMeta {
	dist: {
		[tag: string]: string;
	};
	versions: string[];
}

function matchRange(range: string, meta: PackageMeta): string | undefined {
	if (meta['dist-tags'].hasOwnProperty(range)) {
		return meta['dist-tags'][range];
	}

	return semver.maxSatisfying(Object.keys(meta.versions), range);
}

async function getData(
	url: string,
	opts: { cache: Map<string, any>; fetch: T.Fetch }
): Promise<any> {
	const { fetch } = opts;

	if (opts.cache.has(url)) {
		return opts.cache.get(url);
	}

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Fetching meta data from ${url} failed: ${response.statusText}`);
	}

	const data = response.json();
	opts.cache.set(url, data);
	return data;
}
