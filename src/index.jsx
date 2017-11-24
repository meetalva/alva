import React from 'react';
import ReactDom from 'react-dom';
import path from 'path';
import fs from 'fs';
import styled, { css } from 'styled-components';
import List from './list';


const ColumnGroup = styled.div`
	display: flex;
	flex-direction: row;
	height: 100%;
	font-family: 'Segoe UI';
	font-size: 14px;
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

		const patterns = [{
			'label': 'My first pattern',
			'active': true,
			'children': [
				{
					'label': 'My first pattern',
					'active': true,
					'children': []
				}
			]
		}];

		const pagePath = path.join(this.props.styleGuidePath,
			'stacked', 'projects',
			this.props.projectName, this.props.pageName + '.json');
		const pageModel = JSON.parse(fs.readFileSync(pagePath, 'utf8'));

		const properties = [this.createListItemFromPattern('Root', pageModel.root)];

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

	createListItemFromPattern(key, model) {
		const items = [];
		const properties = model.properties || {};
		Object.entries(properties).forEach(([key, value]) => {
			items.push(this.createListItemFromProperty(key, value));
		});
		const children = model.children || [];
		children.forEach((value, index) => {
			items.push(this.createListItemFromProperty(index + 1, value));
		});

		return {
			label: key + ': ' + model.patternSrc.replace(/^.*\//, ''),
			children: items
		};
	}

	createListItemFromProperty(key, value) {
		if (Array.isArray(value)) {
			const items = [];
			value.forEach((child, index) => {
				items.push(this.createListItemFromProperty('Child ' + (index + 1), child));
			});
			return {label: key, children: items};
		}

		if (value === null || typeof value !== 'object') {
			return {label: key + ': ' + value};
		}

		if (value['_type'] === 'pattern') {
			return this.createListItemFromPattern(key, value);
		} else {
			const items = [];
			Object.entries(value).forEach(([childKey, childValue]) => {
				items.push(this.createListItemFromProperty(childKey, childValue));
			});
			return {label: key, children: items};
		}
	}
}

ReactDom.render(<App
	styleGuidePath='../stacked-example'
	projectName='my-project'
	pageName='mypage'/>,
	document.getElementById('app')
);
