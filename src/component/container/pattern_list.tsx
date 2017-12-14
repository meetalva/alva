import Input from '../../lsg/patterns/input/';
import { PatternFolder } from '../../store/pattern/folder';
import List, { Label, Li, ListItemProps, Ul, Value } from '../../lsg/patterns/list';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { PageElement } from '../../store/page/page_element';
import { Pattern } from '../../store/pattern';
import PatternListItem from '../../lsg/patterns/pattern-list-item';
import * as React from 'react';
import Space, { Size } from '../../lsg/patterns/space';
import { Store } from '../../store';

export interface PatternListProps {
	store: Store;
}

@observer
export class PatternList extends React.Component<PatternListProps> {
	public items: ListItemProps[] = [];
	public constructor(props: PatternListProps) {
		super(props);

		this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
		this.handlePatternClick = this.handlePatternClick.bind(this);
		this.handleDragStart = this.handleDragStart.bind(this);
	}

	public render(): JSX.Element {
		if (this.props.store.getPatternSearchTerm() === '') {
			this.items = this.createItemsFromFolder(
				this.props.store.getPatternRoot() as PatternFolder
			);
		} else {
			this.items = this.props.store
				.searchPatterns(this.props.store.getPatternSearchTerm())
				.map(pattern => ({ value: pattern.getId() }));
		}
		const list = this.createList(this.items);
		return (
			<div>
				<Space sizeBottom={Size.L}>
					<Input handleChange={this.handleSearchInputChange} placeholder="Search" />
				</Space>
				<Space sizeBottom={Size.L}>
					<List>{list}</List>
				</Space>
			</div>
		);
	}

	public createItemsFromFolder(folder: PatternFolder): ListItemProps[] {
		const result: ListItemProps[] = [];

		if (folder) {
			folder.getChildren().forEach((child: PatternFolder) => {
				const childItem: ListItemProps = { value: child.getName() };
				childItem.children = this.createItemsFromFolder(child);
				result.push(childItem);
			});

			folder.getPatterns().forEach((pattern: Pattern) => {
				result.push({
					value: pattern.getId(),
					draggable: true,
					handleDragStart: (e: React.DragEvent<HTMLElement>) => {
						this.handleDragStart(e, pattern);
					},
					onClick: () => {
						this.handlePatternClick(pattern);
					}
				});
			});
		}

		return result;
	}

	public createList(items: ListItemProps[]): JSX.Element {
		return (
			<Ul>
				{items.map((props: ListItemProps, index: number) => {
					const labelComponent = props.label ? <Label>{props.label}:</Label> : null;
					const nextLevel = props.children ? this.createList(props.children) : null;
					if (nextLevel) {
						return (
							<Li key={index}>
								{labelComponent}
								<Value>{props.value}</Value>
								{nextLevel}
							</Li>
						);
					} else {
						return (
							<PatternListItem
								draggable={props.draggable}
								handleDragStart={props.handleDragStart}
								key={index}
								active={props.active}
								onClick={props.onClick}
							>
								{labelComponent}
								<Value>{props.value}</Value>
								{nextLevel}
							</PatternListItem>
						);
					}
				})}
			</Ul>
		);
	}

	@action
	protected handleSearchInputChange(evt: React.ChangeEvent<HTMLInputElement>): void {
		this.props.store.setPatternSearchTerm(evt.target.value);
	}
	@action
	protected handlePatternClick(pattern: Pattern): void {
		const selectedElement: PageElement | undefined = this.props.store.getSelectedElement();
		if (selectedElement) {
			selectedElement.addChild(new PageElement(pattern));
		}
	}
	@action
	protected handleDragStart(e: React.DragEvent<HTMLElement>, pattern: Pattern): void {
		console.log('asdf');
		const data = pattern.getRelativePath();
		e.dataTransfer.setData('patternPath', data);
	}
}
