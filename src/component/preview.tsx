import { ipcRenderer } from 'electron';
import { JsonObject } from '../store/json';
import { observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import { Page } from '../store/page';
import { Preview } from './presentation/preview';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Store } from '../store';

interface PreviewAppProps {
	store: Store;
}

interface PreviewAppState {
	page?: Page;
}

@observer
class PreviewApp extends React.Component<PreviewAppProps, PreviewAppState> {
	public constructor(props: PreviewAppProps) {
		super(props);
	}

	public render(): JSX.Element {
		return (
			<div>
				<Preview page={this.props.store.getCurrentPage()} />
				<DevTools />
			</div>
		);
	}
}

const store = new Store();

ipcRenderer.on('page-change', (event: {}, message: JsonObject) => {
	store.setPageFromJsonInternal(
		message.page as JsonObject,
		message.pageId as string,
		message.propertyId as string
	);
});

ipcRenderer.on('open-styleguide', (event: {}, message: JsonObject) => {
	store.openStyleguide(message.styleGuidePath as string);
});

ReactDom.render(<PreviewApp store={store} />, document.getElementById('app'));
