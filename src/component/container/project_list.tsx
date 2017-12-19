import Dropdown from '../../lsg/patterns/dropdown';
import DropdownItem, {
	DropdownItemLinkAttribute,
	DropdownItemLinkAttributeItem
} from '../../lsg/patterns/dropdown-item';
import { IconName } from '../../lsg/patterns/icons';
import { observer } from 'mobx-react';
import { Project } from '../../store/project/project';
import * as React from 'react';
import { Store } from '../../store/store';

export interface ProjectListProps {
	store: Store;
	open?: boolean;
}

@observer
export class ProjectList extends React.Component<ProjectListProps> {
	public constructor(props: ProjectListProps) {
		super(props);

		this.handleProjectClick = this.handleProjectClick.bind(this);
	}

	public render(): JSX.Element {
		return (
			<Dropdown chrome open={this.props.open}>
				{this.props.store.getProjects().map((project: Project, index) => (
					<DropdownItem
						name={project.getName()}
						key={index}
						handleClick={(e: React.MouseEvent<HTMLElement>) => {
							e.preventDefault();
							this.handleProjectClick(project.getId());
						}}
					>
						<DropdownItemLinkAttribute>
							<DropdownItemLinkAttributeItem>Edit</DropdownItemLinkAttributeItem>
							<DropdownItemLinkAttributeItem>Delete</DropdownItemLinkAttributeItem>
						</DropdownItemLinkAttribute>
					</DropdownItem>
				))}
				<DropdownItem name="New project" icon={IconName.Robo} />
			</Dropdown>
		);
	}
	protected handleProjectClick(id: string): void {
		this.props.store.openFirstPage(id);
	}
}
