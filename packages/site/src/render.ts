import { globalCss } from './global-css';
import { Helmet } from 'react-helmet';

export const render = (input: any) => {
	// tslint:disable-next-line:no-submodule-imports
	const ReactDOM = require('react-dom/server');

	const html = ReactDOM.renderToString(input.default());
	const helmet = Helmet.renderStatic();

	return {
		head: [
			helmet.title.toString(),
			helmet.meta.toString(),
			helmet.link.toString(),
			`<style>${globalCss}</style>`,
			helmet.style.toString()
		].join('\n'),
		html,
		after: ''
	};
};
