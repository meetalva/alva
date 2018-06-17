import * as MobxReact from 'mobx-react';
import { PreviewStore, SyntheticComponents } from '../preview/preview-store';
import { PreviewApplication } from './preview-application';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { PreviewNodeRegistry } from './preview-node-registry';
import { SyntheticBox } from './synthetic-box';
import { SyntheticImage } from './synthetic-image';
import { SyntheticLink } from './synthetic-link';
import { SyntheticPage } from './synthetic-page';
import { SyntheticText } from './synthetic-text';

export interface Injection {
	registry: PreviewNodeRegistry;
	store: PreviewStore<React.SFC>;
}

const registry = new PreviewNodeRegistry();

export function render(store: PreviewStore<React.SFC>, container: HTMLElement): void {
	ReactDom.render(
		<MobxReact.Provider store={store} registry={registry}>
			<PreviewApplication />
		</MobxReact.Provider>,
		container
	);
}

export function getSynthetics(): SyntheticComponents<React.SFC> {
	return {
		'synthetic:box': SyntheticBox,
		'synthetic:image': SyntheticImage,
		'synthetic:link': SyntheticLink,
		'synthetic:page': SyntheticPage,
		'synthetic:text': SyntheticText
	};
}
