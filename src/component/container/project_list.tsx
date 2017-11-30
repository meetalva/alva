import { List, ListPropsListItem } from '../presentation/list';
import { observer } from 'mobx-react';
import { PageRef } from '../../store/page/page_ref';
import { Project } from '../../store/project';
import * as React from 'react';
import { Store } from '../../store';

export interface ProjectListProps {
	store: Store;
}

@observer
export class ProjectList extends React.Component<ProjectListProps> {
	public constructor(props: ProjectListProps) {
		super(props);
	}

	public render(): JSX.Element {
		const items: ListPropsListItem[] = this.props.store.projects.map((project: Project) => ({
			label: 'Project',
			value: project.name,
			children: project.pages.map((page: PageRef) => ({
				label: 'Page',
				value: page.name,
				children: [],
				onClick: (event: React.MouseEvent<HTMLElement>) => { this.props.store.openPage(project.id, page.id); }
			}))
		}));

		return (
			<List headline="Projects" items={items} />
		);
	}
}
