import { PreviewApp } from './preview';
import { HighlightElementFunction } from '../../preview';
import { Store } from '../../../store/store';

export const renderAngular = (store: Store, highlightElement: HighlightElementFunction) => {
	const root = document.getElementById('app');
	if (!root) {
		return;
	}

	root.innerHTML = PreviewApp(store, highlightElement);
};
