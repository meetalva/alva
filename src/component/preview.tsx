import { ipcMain } from 'electron';
import Layout from '../lsg/patterns/layout';
import DevTools from 'mobx-react-devtools';
import { Page } from '../store/page';
import { Preview } from './presentation/preview';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as Serializr from 'serializr';
import styledComponents from 'styled-components';

const PreviewPane = styledComponents.div`
	flex: 2 0 0px;
	padding: 10px;
	box-shadow: inset 0 0 10px 0 rgba(0,0,0,.25);
`;

interface PreviewAppState {
	page?: Page;
}

class PreviewApp extends React.Component<{}, PreviewAppState> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			page: undefined
		};

		ipcMain.on('update-preview', (event: {}, pageJson: string) => {
			this.setState({
				page: Serializr.deserialize({}, pageJson)
			});
		});
	}

	public render(): JSX.Element {
		return (
			<Layout>
				<PreviewPane>
					<Preview page={this.state.page} />
				</PreviewPane>
				<DevTools />
			</Layout>
		);
	}
}

ReactDom.render(<PreviewApp />, document.getElementById('app'));
