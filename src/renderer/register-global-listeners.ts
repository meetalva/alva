import { ViewStore } from '../store';

export function registerGlobalListeners({ store }: { store: ViewStore }): void {
	window.addEventListener('keydown', e => {
		if (e.key === 'Meta') {
			store.setMetaDown(true);
		}
	});

	window.addEventListener('keyup', e => {
		if (e.key === 'Meta') {
			store.setMetaDown(false);
		}
	});

	// Disable drag and drop from outside the application
	document.addEventListener(
		'dragenter',
		event => {
			event.preventDefault();
		},
		false
	);

	document.addEventListener(
		'dragover',
		event => {
			event.dataTransfer.dropEffect = 'none';
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
}
