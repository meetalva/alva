import React from 'react';
import ReactDom from 'react-dom';
import path from 'path';
import fs from 'fs';
import styled, { css } from 'styled-components';
import List from './list';
import Preview from './preview';


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
	max-width: 300px;
	border: 1px solid #ccc;
`;

const ProjectsPane = styled.div`
	flex: 2 0 0px;
	border-bottom: 1px solid #ccc;
`;

const PatternsPane = styled.div`
	flex: 3 0 0px;
`;

const PropertiesPane = styled.div`
	flex: 1 0 0px;
	max-width: 350px;
	border: 1px solid #ccc;
`;

const PreviewPane = styled.div`
	flex: 2 0 0px;
	padding: 10px;
	box-shadow: inset 0 0 10px 0 rgba(0,0,0,.25);
`;


class App extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const projectsPath = path.join(styleGuidePath, 'stacked');
		const projects = this.createProjectsFromFolders(projectsPath);
		
		const patternsPath = path.join(styleGuidePath, 'patterns');
		const patterns = this.createPatternsFromFolders(patternsPath);
		
		const pagePath = path.join(styleGuidePath, 'stacked', 'projects', projectName, pageName + '.json');
		const pageModel = JSON.parse(fs.readFileSync(pagePath, 'utf8'));
		const properties = [this.createListItemFromPattern('Root', pageModel.root)];

		return (
			<ColumnGroup>
				<LeftColumn>
					<ProjectsPane>
						<List headline="Projects" content={projects} />
					</ProjectsPane>

					<PatternsPane>
						<List headline="Patterns" content={patterns} />
					</PatternsPane>
				</LeftColumn>

				<PreviewPane>
					<Preview />
				</PreviewPane>
				
				<PropertiesPane>
					<List headline="Components" content={properties} />
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
			items.push(this.createListItemFromProperty(children.length > 1 ? 'Child ' + (index + 1) : 'Child', value));
		});

		return {
			label: key,
			value: model.patternSrc.replace(/^.*\//, ''),
			children: items
		};
	}

	createListItemFromProperty(key, value) {
		if (Array.isArray(value)) {
			const items = [];
			value.forEach((child, index) => {
				items.push(this.createListItemFromProperty((index + 1), child));
			});
			return {value: key, children: items};
		}

		if (value === null || typeof value !== 'object') {
			return {label: key, value: value};
		}

		if (value['_type'] === 'pattern') {
			return this.createListItemFromPattern(key, value);
		} else {
			const items = [];
			Object.entries(value).forEach(([childKey, childValue]) => {
				items.push(this.createListItemFromProperty(childKey, childValue));
			});
			return {value: key, children: items};
		}
	}

	createProjectsFromFolders(modelPath) {
		const projectsPath = path.join(modelPath, 'projects');
		return fs.readdirSync(projectsPath)
			.map(name => ({name: name, path: path.join(projectsPath, name)}))
			.filter(child => fs.lstatSync(child.path).isDirectory())
			.map(folder => ({
				label: 'Project',
				value: folder.name,
				children: fs.readdirSync(folder.path)
				.filter(child => child.match(/\.json$/))
				.map(folder => ({
					label: 'Page',
					value: folder.replace(/\.json$/, '')
				}))
			}));
	}

	createPatternsFromFolders(parentPath) {
		return fs.readdirSync(parentPath)
			.map(name => ({name: name, path: path.join(parentPath, name)}))
			.filter(child => fs.lstatSync(child.path).isDirectory())
			.map(folder => ({
				value: folder.name,
				children: this.createPatternsFromFolders(folder.path)
			}));
	}
}

global.styleGuidePath = '../stacked-example';
global.projectName = 'my-project';
global.pageName = 'mypage';

global.styleGuidePath = path.resolve(global.styleGuidePath);
ReactDom.render(<App/>, document.getElementById('app')
);
