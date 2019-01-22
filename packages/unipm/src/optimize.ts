import { groupBy, uniqBy } from 'lodash';
import * as semver from 'semver';
import { ResolvedPackage } from './resolve';

export function optimize(tree: ResolvedPackage): ResolvedPackage[] {
	const results = [];
	const packages = flatten(tree);
	const byName = groupBy(packages, (pkg: ResolvedPackage) => pkg.packageName.full);

	Object.keys(byName).forEach(name => {
		const namedPackages = uniqBy(byName[name], 'version').sort((a, b) =>
			semver.rcompare(a.version, b.version)
		);
		const hoisted = namedPackages.shift();
		byName[name] = namedPackages;
		results.push(hoisted);
	});

	Object.keys(byName)
		.filter(name => byName[name].length > 0)
		.forEach(name => {
			const namedPackages = byName[name];
			namedPackages.forEach(p => {
				const parent = p.parents.pop();
				const match = results.find(r => r.packument.name === parent);
				if (match) {
					match.dependencies.push(p);
				}
			});
		});

	return results;
}

export function flatten(tree: ResolvedPackage, init: ResolvedPackage[] = []): ResolvedPackage[] {
	return tree.dependencies.reduce((prev, d) => flatten(d, prev), [
		{ ...tree, dependencies: [] },
		...init
	]);
}
