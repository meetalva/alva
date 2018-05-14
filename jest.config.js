module.exports = {
	transform: {
		"^.+\\.tsx?$": "ts-jest"
	},
	testRegex: "(\\.|/)(test|spec)\\.(jsx?|tsx?)$",
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
	roots: ["src"],
	testEnvironment: "node"
};

