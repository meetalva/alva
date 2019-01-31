import * as Types from '@meetalva/types';
import * as AlvaUtil from '@meetalva/util';

export type PreviewDocumentConfig = PreviewDocumentConfigInline | PreviewDocumentConfigMessage;

export interface PreviewDocumentConfigInline {
	transferType: Types.PreviewTransferType.Inline;
	data: Types.SerializedProject;
	scripts: string[];
}

export interface PreviewDocumentConfigMessage {
	transferType: Types.PreviewTransferType.Message;
	data?: unknown;
	scripts: string[];
}

export const previewDocument = (config: PreviewDocumentConfig) => `<!doctype html>
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
		#preview-highlight,
		#preview-selection {
			box-sizing: border-box;
			pointer-events: none;
			position: fixed;
		}
		#preview-highlight {
			z-index: 100;
			border: 2px solid #42BFFE;
		}
		#preview-selection {
			z-index: 101;
			border: 1px solid rgba(255, 255, 255, 0.5);
			mix-blend-mode: difference;
		}
	</style>
</head>
<body>
	<div id="preview"></div>
	<div id="preview-selection"></div>
	<div id="preview-highlight"></div>
	<textarea data-data="alva" style="display: none">${encodeURIComponent(
		AlvaUtil.toJSON({
			data: config.data,
			transferType: config.transferType,
			mode: Types.PreviewDocumentMode.Live
		})
	)}</textarea>
	${config.scripts ? config.scripts.join('\n') : ''}
	<script src="/scripts/Mobx.js" data-script="Mobx"><\/script>
	<script src="/scripts/previewRenderer.js" data-script="previewRenderer"><\/script>
	<script src="/scripts/preview.js" data-script="preview"><\/script>
</body>
</html>
`;
