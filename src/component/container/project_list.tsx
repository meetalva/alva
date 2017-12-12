import List, { ListItemProps } from '../../lsg/patterns/list';
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
		const items: ListItemProps[] = this.props.store.getProjects().map((project: Project) => ({
			label: 'Project',
			value: project.getName(),
			children: project.getPages().map((page: PageRef) => ({
				label: 'Page',
				value: page.getName(),
				children: [],
				onClick: (event: React.MouseEvent<HTMLElement>) => {
					this.props.store.openPage(project.getId(), page.getId());
				}
			}))
		}));

		return <List headline="Projects" items={items} />;
	}
}
