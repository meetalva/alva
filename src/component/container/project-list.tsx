import Dropdown from '../../lsg/patterns/dropdown';
import DropdownItem from '../../lsg/patterns/dropdown-item';
import { observer } from 'mobx-react';
import { Project } from '../../store/project';
import * as React from 'react';
import { Store } from '../../store/store';

export interface ProjectListProps {
	open?: boolean;
}

@observer
export class ProjectList extends React.Component<ProjectListProps> {
	public constructor(props: ProjectListProps) {
		super(props);

		this.handleProjectClick = this.handleProjectClick.bind(this);
	}

	protected handleProjectClick(id: string): void {
		Store.getInstance().openFirstPage(id);
	}

	public render(): JSX.Element {
		return (
			<Dropdown chrome open={this.props.open}>
				{Store.getInstance()
					.getProjects()
					.map((project: Project, index) => (
						<DropdownItem
							key={project.getId()}
							name={project.getName()}
							handleClick={(e: React.MouseEvent<HTMLElement>) => {
								e.preventDefault();
								this.handleProjectClick(project.getId());
							}}
						/>
					))}
			</Dropdown>
		);
	}
}
