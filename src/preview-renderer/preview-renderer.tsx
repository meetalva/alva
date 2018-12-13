import * as MobxReact from 'mobx-react';
import { PreviewStore } from '../preview/preview-store';
import { PreviewApplication } from './preview-application';
import * as React from 'react';
import * as ReactDom from 'react-dom';

export interface Injection {
	store: PreviewStore<React.SFC>;
}

export function render(store: PreviewStore<React.SFC>, container: HTMLElement): void {
	ReactDom.render(
		<MobxReact.Provider store={store}>
			<PreviewApplication />
		</MobxReact.Provider>,
		container
	);
}
