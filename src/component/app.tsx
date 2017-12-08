import { ElementList } from './container/element_list';
import { IconName, IconRegistry } from '../lsg/patterns/icons';
import Layout from '../lsg/patterns/layout';
import DevTools from 'mobx-react-devtools';
import { PatternList } from './container/pattern_list';
import { ProjectList } from './container/project_list';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Store } from '../store';
import styledComponents from 'styled-components';

const ElementPane = styledComponents.div`
	flex-grow: 0;
	flex-shrink: 1;
	flex-basis: 350px;
	border: 1px solid #ccc;
`;

const ProjectsPane = styledComponents.div`
	flex: 2 0 0px;
	border-bottom: 1px solid #ccc;
`;

const PatternsPane = styledComponents.div`
	flex: 3 0 0px;
`;

const PreviewPane = styledComponents.div`
	flex: 2 0 0px;
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
				<Layout directionVertical>
					<ProjectsPane>
						<ProjectList store={this.props.store} />
					</ProjectsPane>

					<PatternsPane>
						<PatternList store={this.props.store} />
					</PatternsPane>
				</Layout>

				<PreviewPane
					dangerouslySetInnerHTML={{
						__html:
							'<webview style="height: 100%;" src="./preview.html" partition="electron" nodeintegration />'
					}}
				/>

				<ElementPane>
					<ElementList store={this.props.store} />
				</ElementPane>

				<IconRegistry names={IconName} />

				<DevTools />
			</Layout>
		);
	}
}

const store = new Store();
store.openStyleguide('../stacked-example');
store.openPage('my-project', 'mypage');

ReactDom.render(<App store={store} />, document.getElementById('app'));
