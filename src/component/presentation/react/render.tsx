import { PreviewApp } from './preview';
import { HighlightElementFunction } from '../../preview';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Store } from '../../../store/store';

export const renderReact = (store: Store, highlightElement: HighlightElementFunction) => {
	ReactDom.render(
		<PreviewApp store={store} highlightElement={highlightElement} />,
		document.getElementById('app')
	);
};
