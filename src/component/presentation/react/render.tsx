import { PreviewApp } from './preview';
import { HighlightElementFunction } from '../../preview';
import * as React from 'react';
import * as ReactDom from 'react-dom';

export const renderReact = (highlightElement: HighlightElementFunction) => {
	ReactDom.render(
		<PreviewApp highlightElement={highlightElement} />,
		document.getElementById('app')
	);
};
