import * as stringEscape from 'js-string-escape';

const APP_ENTRY = require.resolve('../renderer');
const ZOOM_LEVEL_ENTRY = require.resolve('./set-zoom-level');

export const rendererDocument = `<!doctype html>
<html>
<head>
	<script>require('${stringEscape(ZOOM_LEVEL_ENTRY)}')</script>
</head>
<body>
	<div id="app" style="overflow: hidden; width: 100%; height: 100%;"></div>
	<script>require('${stringEscape(APP_ENTRY)}')</script>
</body>
</html>`;
