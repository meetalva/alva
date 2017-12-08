import Layout from '../lsg/patterns/layout';
import DevTools from 'mobx-react-devtools';
import { Preview } from './presentation/preview';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Store } from '../store';
import styledComponents from 'styled-components';

const PreviewPane = styledComponents.div`
	flex: 2 0 0px;
	padding: 10px;
	box-shadow: inset 0 0 10px 0 rgba(0,0,0,.25);
`;

interface AppProps {
	store: Store;
}

class App extends React.Component<AppProps> {
	public constructor(props: AppProps) {
		super(props);
	}

	public render(): JSX.Element {
		return (
			<Layout>
				<PreviewPane>
					<Preview store={this.props.store} />
				</PreviewPane>
				<DevTools />
			</Layout>
		);
	}
}

const store = new Store();
store.openStyleguide('../stacked-example');
store.openPage('my-project', 'mypage');

ReactDom.render(<App store={store} />, document.getElementById('app'));
