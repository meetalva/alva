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
		const projects = [
			{
				'label': 'My first project',
				'active': true,
				'children': [
					{
						'label': 'My page',
						'active': true,
					},
					{
						'label': 'Another page'
					},
					{
						'label': 'A fantastic page'
					}
				]
			},
			{
				'label': 'Checkout process',
				'children': [
					{
						'label': 'Start page',
						'active': true,
					},
					{
						'label': 'Confirmation page'
					},
					{
						'label': 'Thank-you page'
					}
				]
			}
		];

		const patterns = {
			'label': 'My first pattern',
			'active': true,
			'children': [
				{
					'label': 'My first pattern',
					'active': true,
					'children': []
				}
			]
		};
/*
		const pagePath = path.join(props.styleGuidePath, 'stacked', 'projects',
		props.projectName, props.pageName + '.json');
		const pageModel = JSON.parse(fs.readFileSync(this.pagePath, 'utf8'));

		const properties = this.createProperties(pageModel.root);*/
		const properties = {};

		return (
			<ColumnGroup>
				<LeftColumn>
					<ProjectsPane>
						<List content={projects} />
					</ProjectsPane>

					<PatternsPane>
						<List content={patterns} />
					</PatternsPane>
				</LeftColumn>

				<PreviewPane>
					{/*
						<Preview styleGuidePath={styleGuidePath}
						projectName={projectName}
						pageName={pageName}
					/>*/}
				</PreviewPane>

				<PropertiesPane>
					<List content={properties} />
				</PropertiesPane>
			</ColumnGroup>
		);
	}
/*
	createProperties(model) {
		if (Array.isArray(model)) {
			// Handle arrays by returning a new array with recursively processed elements.
			return model.map((element, index) => {
				return this.createComponent(element, index);
			});
		}

		if (model === null || typeof model !== 'object') {
			// Primitives stay primitives.
			return model;
		}

		if (model['_type'] == 'pattern') {
			const items = [];
			model.properties.forEach(function() {

			})

			return {
				label: model.patternSrc.replace(/^.*\//, ''),
				children: items
			};
		} else {
			// The model is an object, but not a pattern declaration.
			// Create a new object with recursively processed values.
			var result = {};
			Object.keys(model).forEach((key) => {
				result[key] = this.createComponent(model[key]);
			});
			return result;
		}
	}
	*/
}

ReactDom.render(<App
	styleGuidePath='../stacked-example'
	projectName='my-project'
	pageName='mypage'/>,
	document.getElementById('app')
);
