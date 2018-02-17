import Input from '../../lsg/patterns/input/';
import { Folder } from '../../store/styleguide/utils/folder';
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

export interface PatternListContainerItemProps {
	items: NamedPatternListItemProps[];
	name: string;
}

export interface NamedPatternListItemProps extends PatternListItemProps {
	name: string;
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
		containers: PatternListContainerItemProps[],
		term: string
	): PatternListContainerItemProps[] {
		const result: PatternListContainerItemProps[] = [];

		for (const container of containers) {
			if (!container.items.length) {
				continue;
			}

			const matchingItems = container.items.filter(
				item => item.name.toLowerCase().indexOf(term.toLowerCase()) !== -1
			);
			result.push({
				name: container.name,
				items: matchingItems
			});
		}

		return result;
	}

	public render(): JSX.Element {
		let items: PatternListContainerItemProps[] = [];

		this.props.store
			.getStyleguide()
			.getFolders()
			.forEach(folder => {
				items = items.concat(this.createItemsFromFolder(folder));
			});

		this.items = items;

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

	public createItemsFromFolder(folder: Folder<Pattern>): PatternListContainerItemProps[] {
		const result: PatternListContainerItemProps[] = [];

		for (const flatFolder of folder.flattenFolders()) {
			const containerItem: PatternListContainerItemProps = {
				name: flatFolder.getName(),
				items: []
			};

			for (const pattern of flatFolder.getItems()) {
				const icon = pattern.getIconPath();

				containerItem.items.push({
					name: pattern.getName(),
					draggable: true,
					icon,
					handleDragStart: (e: React.DragEvent<HTMLElement>) => {
						this.handleDragStart(e, pattern);
					},
					onClick: () => {
						this.handlePatternClick(pattern);
					}
				});
			}

			result.push(containerItem);
		}

		return result;
	}

	public createList(containers: PatternListContainerItemProps[]): JSX.Element {
		return (
			<PatternList>
				{containers.map((container: PatternListContainerItemProps, index: number) => {
					if (container.items.length) {
						return (
							<PatternList key={index}>
								<PatternLabel>{container.name}</PatternLabel>
								{container.items.map((item, itemIndex) => (
									<PatternListItem
										draggable={item.draggable}
										handleDragStart={item.handleDragStart}
										key={itemIndex}
										icon={item.icon}
										onClick={item.onClick}
									>
										{item.name}
									</PatternListItem>
								))}
							</PatternList>
						);
					}

					return;
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
		e.dataTransfer.dropEffect = 'copy';
		e.dataTransfer.setDragImage(
			e.currentTarget.querySelector('.pattern__icon') as Element,
			12,
			12
		);

		e.dataTransfer.setData('analyzerId', pattern.getAnalyzer().getId());
		e.dataTransfer.setData('patternId', pattern.getId());
	}
}
