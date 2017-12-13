import List, { Label, Li, ListItemProps, Ul, Value } from '../../lsg/patterns/list';
import { observer } from 'mobx-react';
import { PageRef } from '../../store/project/page_ref';
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
					this.props.store.openPage(page.getId());
				}
			}))
		}));

		const list = this.createList(items);

		return <List headline="Projects">{list}</List>;
	}

	public createList(items: ListItemProps[]): JSX.Element {
		return (
			<Ul>
				{items.map((props: ListItemProps, index: number) => {
					const labelComponent = props.label ? <Label>{props.label}:</Label> : null;
					const nextLevel = props.children ? this.createList(props.children) : null;

					return (
						<Li
							draggable={props.draggable}
							onDragStart={props.handleDragStart}
							key={index}
							active={props.active}
							onClick={props.onClick}
						>
							{labelComponent}
							<Value>{props.value}</Value>
							{nextLevel}
						</Li>
					);
				})}
			</Ul>
		);
	}
}
