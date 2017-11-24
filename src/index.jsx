import React from 'react';
import ReactDom from 'react-dom';
import styled, { css } from 'styled-components';
import List from './list';


const ColumnGroup = styled.div`
	display: flex;
	flex-direction: row;
	height: 100%;
	font-family: 'Segoe UI';
	font-size: 12px;
	box-sizing: border-box;
`;

const LeftColumn = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1 0 0px;
	border: 1px solid #ccc;
`;

const ProjectsPane = styled.div`
	flex: 2 0 0px;
	border-bottom: 1px solid #ccc;
	padding: 6px 0;
`;

const PatternsPane = styled.div`
	flex: 3 0 0px;
	padding: 6px 0;
`;

const PreviewPane = styled.div`
	flex: 2 0 0px;
	padding: 10px;
	box-shadow: inset 0 0 10px 0 rgba(0,0,0,.25);
`;

const PropertiesPane = styled.div`
	flex: 1 0 0px;
	border: 1px solid #ccc;
	padding: 6px 0;
`;


class App extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<ColumnGroup>
				<LeftColumn>
					<ProjectsPane>
						<List content={[]}/>
					</ProjectsPane>

					<PatternsPane>
						<List content={[]}/>
					</PatternsPane>
				</LeftColumn>

				<PreviewPane>
					{/*<Preview />*/}
				</PreviewPane>

				<PropertiesPane>
					<List content={[{
							'label': 'My first project',
							'active': true,
							'children': [
								{
									'label': 'My first project',
									'active': true,
									'children': []
								}
							]
						}]}/>
				</PropertiesPane>
			</ColumnGroup>
		);
	}
}

ReactDom.render(<App />, document.getElementById('app'));
