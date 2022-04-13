module.exports = {
	env: {
		commonjs: true,
		es2021: true,
		node: true,
	},
	extends: ["standard"],
	parserOptions: {
		ecmaVersion: "latest",
	},
	rules: {
		"no-tabs": "off",
		"space-before-function-paren": "off",
		indent: "off",
		quotes: "off",
		semi: "off",
		"comma-dangle": "off",
		"no-async-promise-executor": "off",
	},
};
