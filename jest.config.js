module.exports = {
	transform: {
		"^.+\\.tsx?$": "ts-jest"
	},
	testRegex: "\/test\/[^\.]*\.tsx?$",
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
	roots: ["src"],
	testEnvironment: "node"
};

