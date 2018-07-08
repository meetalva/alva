import * as Fs from 'fs';
import * as Path from 'path';
import * as Types from '../types';

const SCRIPT_PATHS = [
	require.resolve('../scripts/Mobx'),
	require.resolve('../scripts/renderer'),
	require.resolve('../scripts/preview')
];

export interface StaticDocumentConfig {
	data: Types.SerializedProject;
	scripts: string[];
}

export const staticDocument = (config: StaticDocumentConfig): string => {
	// Read preview scripts from disk
	const scripts = SCRIPT_PATHS.map(scriptPath => ({
		basename: Path.basename(scriptPath, Path.extname(scriptPath)),
		content: Fs.readFileSync(scriptPath)
	})).map(script => `<script data-script="${script.basename}">${script.content}</script>`);

	config.scripts = [...config.scripts, ...scripts];
	return doc(config);
};

const doc = (config: StaticDocumentConfig) => `<!doctype html>
<html>
<head>
	<meta charset="utf-8"/>
	<title></title>
	<style>
		html, body {
			margin: 0;
			background: white;
		}
		#preview {
			background: white;
		}
	</style>
</head>
<body>
	<div id="preview"></div>
	<textarea data-data="alva" style="display: none">${encodeURIComponent(
		JSON.stringify({
			data: config.data,
			mode: Types.PreviewDocumentMode.Static
		})
	)}</textarea>
	${config.scripts ? config.scripts.join('\n') : ''}
</body>
</html>
`;
