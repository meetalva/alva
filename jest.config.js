// @ts-check
module.exports = {
	preset: "ts-jest",
	testMatch: ["**/*.test.ts", "**/*.test.tsx"],
	roots: [
		"packages/core",
		"packages/essentials",
		"packages/site",
		"packages/tools",
		"packages/unipm"
	],
	testPathIgnorePatterns: [
		"node_modules",
		"lib"
	],
	globals: {
		"ts-jest": {
			diagnostics: false
		}
	}
};
