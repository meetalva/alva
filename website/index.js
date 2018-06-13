const content = require('./content.html');
const css = require('./website.css');
const head = require('./head.html');
const js = require('raw-loader!./website.js');

module.exports = {
	css: () => css,
	head: () => head,
	html: () => content,
	js: () => js,
	render: input => ({
		css: input.css(),
		head: input.head(),
		html: input.html(),
		js: input.js()
	})
};
