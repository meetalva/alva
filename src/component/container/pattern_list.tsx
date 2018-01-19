import Input from '../../lsg/patterns/input/';
import { PatternFolder } from '../../store/pattern/folder';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { PageElement } from '../../store/page/page-element';
import { Pattern } from '../../store/pattern/pattern';
import PatternList, {
	PatternLabel,
	PatternListItem,
	PatternListItemProps
} from '../../lsg/patterns/pattern-list';
import * as React from 'react';
import Space, { Size } from '../../lsg/patterns/space';
import { Store } from '../../store/store';

export interface PatternListContainerProps {
	store: Store;
}

export interface PatternListContainerItemProps extends PatternListItemProps {
	children?: PatternListContainerItemProps[];
	value: string;
}

@observer
export class PatternListContainer extends React.Component<PatternListContainerProps> {
	public items: PatternListContainerItemProps[] = [];
	public constructor(props: PatternListContainerProps) {
		super(props);

		this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
		this.handlePatternClick = this.handlePatternClick.bind(this);
		this.handleDragStart = this.handleDragStart.bind(this);
	}

	public search(
		listItem: PatternListContainerItemProps[],
		term: string
	): PatternListContainerItemProps[] {
		const result: PatternListContainerItemProps[] = [];

		listItem.map(item => {
			if (item.value.toLowerCase().indexOf(term.toLowerCase()) !== -1 && !item.children) {
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
				<Space sizeBottom={Size.XXS}>
					<Input handleChange={this.handleSearchInputChange} placeholder="Search patterns" />
				</Space>
				<Space size={[0, Size.L]}>{list}</Space>
			</div>
		);
	}

	public createItemsFromFolder(folder: PatternFolder): PatternListContainerItemProps[] {
		const result: PatternListContainerItemProps[] = [];
		if (folder) {
			folder.getChildren().forEach((child: PatternFolder) => {
				const childItem: PatternListContainerItemProps = { value: child.getName() };
				childItem.children = this.createItemsFromFolder(child);
				result.push(childItem);
			});

			folder.getPatterns().forEach((pattern: Pattern) => {
				result.push({
					value: pattern.getName(),
					draggable: true,
					icon: pattern.getIconPath(),
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

	public createList(items: PatternListContainerItemProps[]): JSX.Element {
		return (
			<PatternList>
				{items.map((props: PatternListContainerItemProps, index: number) => {
					if (props.children) {
						return (
							<PatternList key={index}>
								<PatternLabel>{props.value}</PatternLabel>
								{this.createList(props.children)}
							</PatternList>
						);
					}
					return (
						<PatternListItem
							draggable={props.draggable}
							handleDragStart={props.handleDragStart}
							key={index}
							icon={props.icon}
							onClick={props.onClick}
						>
							{props.value}
						</PatternListItem>
					);
				})}
			</PatternList>
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
			const newPageElement = new PageElement(pattern, true);
			selectedElement.addSibling(newPageElement);
			this.props.store.setSelectedElement(newPageElement);
		}
	}

	@action
	protected handleDragStart(e: React.DragEvent<HTMLElement>, pattern: Pattern): void {
		const data = pattern.getRelativePath();
		e.dataTransfer.dropEffect = 'copy';
		e.dataTransfer.setDragImage(
			e.currentTarget.querySelector('.pattern__icon') as Element,
			12,
			12
		);
		e.dataTransfer.setData('patternPath', data);
	}
}
