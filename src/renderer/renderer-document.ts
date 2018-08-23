export const rendererDocument = (_: {
	base: string | undefined;
	hot: boolean | undefined;
}) => `<!doctype html>
<html>
<head>
</head>
<body>
	<div id="app" style="overflow: hidden; width: 100%; height: 100%;"></div>
	<script src="/scripts/Mobx.js"></script>
	<script src="/scripts/renderer.js"></script>
</body>
</html>`;
