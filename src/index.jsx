import React from 'react';
import ReactDom from 'react-dom';
import styled, { css } from 'styled-components';
import Preview from './dist/preview';


const ColumnGroup = styled.div`
	display: flex;
	flex-direction: row;
	height: 100%;
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
	padding: 4px 0;
`;

const PatternsPane = styled.div`
	flex: 3 0 0px;
	padding: 4px 0;
`;

const PreviewPane = styled.div`
	flex: 2 0 0px;
	padding: 10px;
	box-shadow: inset 0 0 10px 0 rgba(0,0,0,.25);
`;

const PropertiesPane = styled.div`
	flex: 1 0 0px;
	border: 1px solid #ccc;
	padding: 4px 0;
`;

const List = styled.ul`
	padding: 0 0 0 12px;
	margin: 0;
	width: 100%;
`;

const ListItem = styled.li`
	padding: 0;
	margin: 4px 0;
	font-family: Arial;
	font-size: 15px;
	list-style: none;
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
						<List>
							<ListItem active={true}>
								My first project
								<List>
									<ListItem active={true}>
										My page
									</ListItem>
									<ListItem active={true}>
										Another page
									</ListItem>
									<ListItem active={true}>
										A fanstastic page
									</ListItem>
								</List>
							</ListItem>
							<ListItem active={true}>
								Checkout process
								<List>
									<ListItem active={true}>
										Start page
									</ListItem>
									<ListItem active={true}>
										Confirmation page
									</ListItem>
									<ListItem active={true}>
										Thank-you page
									</ListItem>
								</List>
							</ListItem>
						</List>
					</ProjectsPane>
					
					<PatternsPane>
					</PatternsPane>
				</LeftColumn>

				<PreviewPane>
					<Preview />
				</PreviewPane>

				<PropertiesPane>
				</PropertiesPane>
			</ColumnGroup>
		);
	}
}

ReactDom.render(<App />, document.getElementById('app'));
