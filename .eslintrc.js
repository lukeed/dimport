module.exports = {
	env: {
		browser: true,
		node: true,
		es6: true
	},
	extends: 'eslint:recommended',
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module'
	},
	rules: {
		'no-cond-assign': 0,
		'no-ex-assign': 0
	}
};
