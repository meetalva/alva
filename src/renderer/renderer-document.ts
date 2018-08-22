// 'http://localhost:8080'

export const rendererDocument = ({ hot }: { hot: boolean | undefined }) => `<!doctype html>
<html>
<head>
</head>
<body>
	<div id="app" style="overflow: hidden; width: 100%; height: 100%;"></div>
	<script src="${hot ? 'http://localhost:8080' : ''}/scripts/renderer.js"></script>
</body>
</html>`;
