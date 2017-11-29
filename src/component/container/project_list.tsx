import List from '../presentation/list';
import { ListPropsListItem } from '../presentation/list';
import React from 'react';
import Store from '../../store';
import Project from '../../store/project';
import PageRef from '../../store/page/page_ref';


interface ProjectListProps {
	store: Store
}

export default class ProjectList extends React.Component<ProjectListProps> {
	constructor(props: ProjectListProps) {
		super(props);
	}

	render() {
		const items: ListPropsListItem[] = this.props.store.projects.map((project: Project) => ({
			label: 'Project',
			value: project.name,
			children: project.pages.map((page: PageRef) => ({
				label: 'Page',
				value: page.name,
				children: []
			}))
		}));

		return (
			<List headline="Projects" items={items} />
		);
	}
}
