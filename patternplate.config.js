module.exports = {
	docs: ['docs/**/*.md'],
	entry: ['build/lsg/patterns/**/demo.js'],
	render: '@patternplate/render-styled-components/render',
	mount: '@patternplate/render-styled-components/mount',
};
