module.exports = {
	docs: ['docs/**/*.md'],
	entry: ['dist/lsg/patterns/**/demo.js'],
	render: '@patternplate/render-styled-components/render',
	mount: '@patternplate/render-styled-components/mount',
	ui: {
		title: '@patternplate/components'
	}
};
