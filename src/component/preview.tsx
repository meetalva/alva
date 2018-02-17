import { ipcRenderer } from 'electron';
import { JsonObject } from '../store/json';
import { observer } from 'mobx-react';
import { Page } from '../store/page/page';
import { PageElement } from '../store/page/page-element';
import { Preview } from './presentation/preview';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Store } from '../store/store';

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
		let DevTools;
		try {
			const DevToolsExports = require('mobx-react-devtools');
			DevTools = DevToolsExports ? DevToolsExports.default : undefined;
		} catch (error) {
			// Ignored
		}

		const selectedElement: PageElement | undefined = this.props.store.getSelectedElement();
		return (
			<div>
				<Preview
					page={this.props.store.getCurrentPage()}
					selectedElementId={selectedElement && selectedElement.getId()}
				/>
				{DevTools ? <DevTools /> : ''}
			</div>
		);
	}
}

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

window.onload = () => {
	ReactDom.render(<PreviewApp store={store} />, document.getElementById('app'));
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
