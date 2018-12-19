import * as MobxReact from 'mobx-react';
import { PreviewStore, SyntheticComponents } from '../preview/preview-store';
import { PreviewApplication } from './preview-application';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { SyntheticBox } from './synthetic-box';
import { SyntheticConditional } from './synthetic-conditional';
import { SyntheticImage } from './synthetic-image';
import { SyntheticLink } from './synthetic-link';
import { SyntheticPage } from './synthetic-page';
import { SyntheticText } from './synthetic-text';

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

export function getSynthetics(): SyntheticComponents<React.SFC> {
	return {
		'synthetic:box': SyntheticBox as any,
		'synthetic:conditional': SyntheticConditional,
		'synthetic:image': SyntheticImage,
		'synthetic:link': SyntheticLink,
		'synthetic:page': SyntheticPage,
		'synthetic:text': SyntheticText
	};
}
