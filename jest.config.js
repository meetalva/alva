// @ts-check
module.exports = {
	preset: 'ts-jest',
	testMatch: ['**/*.test.ts', '**/*.test.tsx'],
	modulePathIgnorePatterns: ['<rootDir>\/packages\/core\/nccbuild\/(.*)'],
	roots: [
		'packages/analyzer',
		'packages/components',
		'packages/core',
		'packages/essentials',
		'packages/message',
		'packages/model',
		'packages/model-tree',
		'packages/site',
		'packages/tools',
		'packages/types',
		'packages/util'
	],
	testPathIgnorePatterns: ['node_modules', 'lib'],
	globals: {
		'ts-jest': {
			diagnostics: {
				ignoreCodes: [151001, 2339]
			}
		}
	}
};
