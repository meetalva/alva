export enum PreviewDocumentMode {
	Live = 'live',
	LiveMirror = 'live-mirror',
	Static = 'static'
}

export type PreviewDocumentConfig = LivePreviewDocumentConfig | StaticPreviewDocumentConfig;

export interface LivePreviewDocumentConfig {
	data: object;
	mode: PreviewDocumentMode.Live | PreviewDocumentMode.LiveMirror;
}

export interface StaticPreviewDocumentConfig {
	content: string;
	data: object;
	mode: PreviewDocumentMode.Static;
	scripts: string;
}

const PRELOADER = `
<style>
html,
body,
preview,
.outer {
	min-height: 100vh;
	min-width: 100vw;
}

.outer {
	display: flex;
	align-items: center;
	justify-content: center;
}

.circle_outer {
	position: absolute;
	width: 6%;
	height: 0;
	padding-bottom: 6%;
	border-radius: 50%;
	animation: a_outer 1.1s 0.45s infinite alternate;
	background: rgba(65, 148, 224, 0.2);
}

.circle_lblue {
	position: absolute;
	width: 6%;
	height: 0;
	padding-bottom: 6%;
	border-radius: 50%;
	animation: a_lblue 1.1s 0.32s infinite alternate;
	background: rgba(65, 148, 224, 0.3);
}

.circle_blue {
	position: absolute;
	width: 8%;
	height: 0;
	padding-bottom: 8%;
	border-radius: 50%;
	animation: a_blue 1.1s infinite alternate-reverse;
	background: rgb(65, 148, 224);
}

/* Animations */

@keyframes a_outer {
	to {
		transform: scale(2.5);
	}
}

@keyframes a_blue {
	to {
		transform: scale(1.1);
	}
}

@keyframes a_lblue {
	to {
		transform: scale(2.0);
	}
}
</style>
<div class="outer">
<div class="circle_outer"></div>
<div class="circle_lblue"></div>
<div class="circle_blue"></div>
</div>
`;

const LIVE_SCRIPTS = `
<script src="/scripts/renderer.js" data-script="renderer"><\/script>
<script src="/scripts/components.js" data-script="components"><\/script>
<script src="/scripts/preview.js" data-script="preview"><\/script>
`;

export const previewDocument = (config: PreviewDocumentConfig) => `<!doctype html>
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
	<div id="preview">
		${config.mode === PreviewDocumentMode.Static ? config.content : ''}
		${config.mode === PreviewDocumentMode.Live ? PRELOADER : ''}
	</div>
	<textarea data-data="alva" style="display: none">${encodeURIComponent(
		JSON.stringify({
			data: config.data,
			mode: config.mode
		})
	)}</textarea>
	${config.mode === PreviewDocumentMode.Static ? config.scripts : ''}
	${config.mode !== PreviewDocumentMode.Static ? LIVE_SCRIPTS : ''}
</body>
</html>
`;
