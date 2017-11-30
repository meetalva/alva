import List from '../presentation/list';
import { ListPropsListItem } from '../presentation/list';
import { observer } from 'mobx-react';
import * as React from 'react';
import Store from '../../store';
import Project from '../../store/project';
import PageRef from '../../store/page/page_ref';


export interface ProjectListProps {
	store: Store
}

@observer
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
				children: [],
				onClick: event => { this.props.store.openPage(project.id, page.id); }
			}))
		}));

		return (
			<List headline="Projects" items={items} />
		);
	}
}
