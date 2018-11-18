import * as Fs from 'fs';
import * as Path from 'path';
import * as Types from '../types';
import * as AlvaUtil from '../alva-util';

export interface StaticDocumentConfig {
	data: Types.SerializedProject;
	scripts: string[];
}

export const staticDocument = (config: StaticDocumentConfig): string => {
	const SCRIPT_PATHS = [
		require.resolve('../scripts/Mobx'),
		require.resolve('../scripts/previewRenderer'),
		require.resolve('../scripts/preview')
	];

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
	<meta name="viewport" content="width=device-width" />
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
		AlvaUtil.toJSON({
			data: config.data,
			mode: Types.PreviewDocumentMode.Static
		})
	)}</textarea>
	${config.scripts ? config.scripts.join('\n') : ''}
</body>
</html>
`;
