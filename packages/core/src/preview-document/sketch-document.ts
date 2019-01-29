import * as Path from 'path';
import * as Types from '@meetalva/types';
import * as AlvaUtil from '@meetalva/util';
import * as fetch from 'isomorphic-fetch';

export interface SketchDocumentConfig {
	data: Types.SerializedProject;
	scripts: string[];
}

export const sketchDocument = async (config: SketchDocumentConfig): Promise<string> => {
	const SCRIPT_PATHS = [
		'/scripts/exportToSketchData.js',
		'/scripts/Mobx.js',
		'/scripts/previewRenderer.js',
		'/scripts/preview.js'
	];

	// Read preview scripts from disk
	const scripts = (await Promise.all(
		SCRIPT_PATHS.map(async scriptPath => ({
			basename: Path.basename(scriptPath, Path.extname(scriptPath)),
			content: await fetch(scriptPath).then(r => r.text())
		}))
	)).map(script => `<script data-script="${script.basename}">${script.content}</script>`);

	config.scripts = [...config.scripts, ...scripts];
	return doc(config);
};

const doc = (config: SketchDocumentConfig) => `<!doctype html>
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
		AlvaUtil.toJSON({
			data: config.data,
			mode: Types.PreviewDocumentMode.Static
		})
	)}</textarea>
	${config.scripts ? config.scripts.join('\n') : ''}
</body>
</html>
`;
