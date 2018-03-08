import { ipcRenderer } from 'electron';
import { JsonObject } from '../store/json';
import { renderReact } from './presentation/react/render';
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

const store = new Store();

ipcRenderer.on('page-change', (event: {}, message: JsonObject) => {
	store.setPageFromJsonInternal(message.page as JsonObject, message.pageId as string);
});

ipcRenderer.on('open-styleguide', (event: {}, message: JsonObject) => {
	store.openStyleguide(message.styleGuidePath as string);
});

ipcRenderer.on('selectedElement-change', (event: {}, message: JsonObject) => {
	store.setSelectedElementById(message.selectedElementId as number[]);
});

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
	renderReact(store, highlightElement);
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
