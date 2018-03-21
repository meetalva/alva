import { ipcRenderer } from 'electron';
import { JsonObject } from '../store/json';
import { Page } from '../store/page/page';
import * as SmoothscrollPolyfill from 'smoothscroll-polyfill';
import { Store } from '../store/store';

export interface HighlightAreaProps extends ClientRect {
	opacity?: number;
}

export type HighlightElementFunction = (
	element: Element,
	currentHighlightArea: HighlightAreaProps,
	callback: (newHighlightArea: HighlightAreaProps) => void
) => void;

const store = Store.getInstance();

ipcRenderer.on('styleguide-change', (event: {}, message: JsonObject) => {
	store.setStyleguideFromJsonInternal(message);
});

ipcRenderer.on('page-change', (event: {}, message: JsonObject) => {
	store.setPageFromJsonInternal(message);
	render();
});

ipcRenderer.on('selectedElement-change', (event: {}, message: JsonObject) => {
	const page = store.getCurrentPage() as Page;
	store.setSelectedElement(page.getElementById(message.selectedElementId as string));
});

ipcRenderer.send('preview-ready');

const highlightElement: HighlightElementFunction = (element, currentHighlightArea, callback) => {
	const clientRect: ClientRect = element.getBoundingClientRect();
	const newHighlightArea: HighlightAreaProps = {
		bottom: clientRect.bottom,
		height: clientRect.height,
		left: clientRect.left + window.scrollX,
		opacity: 1,
		right: clientRect.right,
		top: clientRect.top + window.scrollY,
		width: clientRect.width
	};

	if (
		newHighlightArea.top === currentHighlightArea.top &&
		newHighlightArea.right === currentHighlightArea.right &&
		newHighlightArea.bottom === currentHighlightArea.bottom &&
		newHighlightArea.left === currentHighlightArea.left &&
		newHighlightArea.height === currentHighlightArea.height &&
		newHighlightArea.width === currentHighlightArea.width
	) {
		return;
	}

	element.scrollIntoView({
		behavior: 'smooth',
		block: 'center',
		inline: 'nearest'
	});

	setTimeout(() => hideHighlightArea(newHighlightArea, callback), 500);
	callback(newHighlightArea);
};

function render(): void {
	const styleguide = store.getStyleguide();
	const analyzer = styleguide ? styleguide.getAnalyzer() : undefined;
	if (analyzer) {
		analyzer.render(highlightElement);
	}
}

function hideHighlightArea(
	highlightArea: HighlightAreaProps,
	callback: (highlightArea: HighlightAreaProps) => void
): void {
	const newHighlightArea = highlightArea;
	newHighlightArea.opacity = 0;

	callback(newHighlightArea);
}

window.onload = () => {
	SmoothscrollPolyfill.polyfill();
};

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
