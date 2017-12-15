import Input from '../../lsg/patterns/input/';
import { PatternFolder } from '../../store/pattern/folder';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { PageElement } from '../../store/page/page_element';
import { Pattern } from '../../store/pattern';
import PatternList, { PatternLabel, PatternListItem } from '../../lsg/patterns/pattern-list';
import * as React from 'react';
import Space, { Size } from '../../lsg/patterns/space';
import { Store } from '../../store';

export interface PatternListContainerProps {
	store: Store;
}

export interface PatternFoo {
	children?: PatternFoo[];
	draggable?: boolean;
	handleDragStart?: React.DragEventHandler<HTMLElement>;
	onClick?: React.MouseEventHandler<HTMLElement>;
	value: string;
}

@observer
export class PatternListContainer extends React.Component<PatternListContainerProps> {
	public items: PatternFoo[] = [];
	public constructor(props: PatternListContainerProps) {
		super(props);

		this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
		this.handlePatternClick = this.handlePatternClick.bind(this);
		this.handleDragStart = this.handleDragStart.bind(this);
	}

	public search(listItem: PatternFoo[], term: string): PatternFoo[] {
		const result: PatternFoo[] = [];

		listItem.map(item => {
			if (item.value.indexOf(term) !== -1 && !item.children) {
				result.push(item);
			} else if (item.children) {
				const folder = { value: item.value, children: [] };
				result.push(folder, ...this.search(item.children, term));
			}
		});
		return result;
	}

	public render(): JSX.Element {
		this.items = this.createItemsFromFolder(this.props.store.getPatternRoot() as PatternFolder);
		if (this.props.store.getPatternSearchTerm() !== '') {
			this.items = this.search(this.items, this.props.store.getPatternSearchTerm());
		}
		const list = this.createList(this.items);
		return (
			<div>
				<Space sizeBottom={Size.L}>
					<Input handleChange={this.handleSearchInputChange} placeholder="Search" />
				</Space>
				<Space sizeBottom={Size.L}>{list}</Space>
			</div>
		);
	}

	public createItemsFromFolder(folder: PatternFolder): PatternFoo[] {
		const result: PatternFoo[] = [];
		if (folder) {
			folder.getChildren().forEach((child: PatternFolder) => {
				const childItem: PatternFoo = { value: child.getName() };
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

	public createList(items: PatternFoo[]): JSX.Element {
		return (
			<div>
				{items.map((props: PatternFoo, index: number) => {
					if (props.children) {
						return (
							<div>
								<PatternLabel key={index}>{props.value}</PatternLabel>
								<PatternList>{this.createList(props.children)}</PatternList>
							</div>
						);
					} else {
						return (
							<PatternListItem
								draggable={props.draggable}
								handleDragStart={props.handleDragStart}
								key={index}
								onClick={props.onClick}
							>
								{props.value}
							</PatternListItem>
						);
					}
				})}
			</div>
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
			const newPageElement = new PageElement(pattern);
			selectedElement.addChild(newPageElement);
			this.props.store.setSelectedElement(newPageElement);
		}
	}
	@action
	protected handleDragStart(e: React.DragEvent<HTMLElement>, pattern: Pattern): void {
		const data = pattern.getRelativePath();
		e.dataTransfer.setData('patternPath', data);
	}
}
