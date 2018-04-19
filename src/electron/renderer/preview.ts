import { ipcRenderer } from 'electron';
import { JsonObject } from '../../store/json';
import { Page } from '../../store/page/page';
import { SketchExporter } from '../../export/sketch-exporter';
import * as SmoothscrollPolyfill from 'smoothscroll-polyfill';
import { Store } from '../../store/store';

window.onload = () => {
	SmoothscrollPolyfill.polyfill();
};

const store = Store.getInstance();

ipcRenderer.on('styleguide-change', (event: {}, message: JsonObject) => {
	store.setStyleguideFromJsonInternal(message);
});

ipcRenderer.on('page-change', (event: {}, message: JsonObject) => {
	store.setPageFromJsonInternal(message);

	const styleguide = store.getStyleguide();
	const analyzer = styleguide ? styleguide.getAnalyzer() : undefined;
	if (analyzer) {
		analyzer.render();
	}
});

ipcRenderer.on('selectedElement-change', (event: {}, message: JsonObject) => {
	const page = store.getCurrentPage() as Page;
	store.setSelectedElement(page.getElementById(message.selectedElementId as string));
});

ipcRenderer.on('export-as-sketch', (event: {}, path: string) => {
	SketchExporter.exportToSketch(path);
});

ipcRenderer.send('preview-ready');

// Disable drag and drop from outside the application
document.addEventListener(
	'dragover',
	event => {
		event.preventDefault();
	},
	false
);
document.addEventListener(
	'drop',
	event => {
		event.preventDefault();
	},
	false
);
