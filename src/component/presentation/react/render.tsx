import * as React from 'react';
import * as ReactDom from 'react-dom';

import { PreviewApp } from './preview';
import { HighlightElementFunction } from '../../preview';

export const renderReact = (highlightElement: HighlightElementFunction) => {
	ReactDom.render(
		<PreviewApp highlightElement={highlightElement} />,
		document.getElementById('app')
	);
};
