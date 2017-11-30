import ElementList from './container/element_list';
import PatternList from './container/pattern_list';
import ProjectList from './container/project_list';
import Preview from './presentation/preview';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import Store from '../store';
import styledComponents from 'styled-components';


const ColumnGroup = styledComponents.div`
	display: flex;
	flex-direction: row;
	min-height: 100%;
	font-family: 'Segoe UI';
	font-size: 14px;
	box-sizing: border-box;
`;

const LeftColumn = styledComponents.div`
	display: flex;
	flex-direction: column;
	flex-grow: 0;
	flex-shrink: 1;
	flex-basis: 300px;
	border: 1px solid #ccc;
`;

const ElementPane = styledComponents.div`
	display: flex;
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
	padding: 10px;
	box-shadow: inset 0 0 10px 0 rgba(0,0,0,.25);
`;

interface AppProps {
	store: Store;
}

class App extends React.Component<AppProps> {
	constructor(props: AppProps) {
		super(props);
	}

	render() {
		return (
			<ColumnGroup>
				<LeftColumn>
					<ProjectsPane>
						<ProjectList store={this.props.store} />
					</ProjectsPane>

					<PatternsPane>
						<PatternList store={this.props.store} />
					</PatternsPane>
				</LeftColumn>

				<PreviewPane>
					<Preview store={this.props.store} />
				</PreviewPane>

				<ElementPane>
					<ElementList store={this.props.store} />
				</ElementPane>
			</ColumnGroup>
		);
	}
}

const store = new Store();
store.openStyleguide('../stacked-example');
store.openPage('my-project', 'mypage');

ReactDom.render(<App store={store} />, document.getElementById('app'));
