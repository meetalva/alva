import * as GraphicWeb from './graphik-web';

export const globalCss = `
body {
	margin: 0;
	padding: 0;
	min-width: 320px;
}

@font-face {
	font-family: 'Graphik Web';
	src: url(data:application/font-woff;charset=utf-8;base64,${GraphicWeb.GraphicWeb}) format('woff');
	font-weight: 300;
	font-style: normal;
}

@font-face {
	font-family: 'Graphik Web';
	src: url(data:application/font-woff;charset=utf-8;base64,${
		GraphicWeb.GraphicWebRegular
	}) format('woff');
	font-weight: 400;
	font-style: normal;
}

@font-face {
	font-family: 'Graphik Web';
	src: url(data:application/font-woff;charset=utf-8;base64,${
		GraphicWeb.GraphicWebBold
	}) format('woff');
	font-weight: 500;
	font-style: normal;
}
`;
