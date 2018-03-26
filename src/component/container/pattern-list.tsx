import Input from '../../lsg/patterns/input/';
import { ElementCommand } from '../../store/command/element-command';
import { PatternFolder } from '../../store/styleguide/folder';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { PageElement } from '../../store/page/page-element';
import { Pattern } from '../../store/styleguide/pattern';
import PatternList, {
	PatternLabel,
	PatternListItem,
	PatternListItemProps
} from '../../lsg/patterns/pattern-list';
import * as React from 'react';
import Space, { Size } from '../../lsg/patterns/space';
import { Store } from '../../store/store';

export interface PatternListContainerItemProps {
	items: NamedPatternListItemProps[];
	name: string;
}

export interface NamedPatternListItemProps extends PatternListItemProps {
	name: string;
}

@observer
export class PatternListContainer extends React.Component {
	public items: PatternListContainerItemProps[] = [];

	public constructor(props: {}) {
		super(props);

		this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
		this.handlePatternClick = this.handlePatternClick.bind(this);
		this.handleDragStart = this.handleDragStart.bind(this);
	}

	public createItemsFromFolder(parent: PatternFolder): PatternListContainerItemProps[] {
		const result: PatternListContainerItemProps[] = [];

		for (const folder of parent.getDescendants()) {
			const containerItem: PatternListContainerItemProps = {
				name: folder.getName(),
				items: []
			};

			for (const pattern of folder.getPatterns()) {
				containerItem.items.push({
					name: pattern.getName(),
					draggable: true,
					icon: pattern.getIconPath(),
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
	protected handleDragStart(e: React.DragEvent<HTMLElement>, pattern: Pattern): void {
		e.dataTransfer.dropEffect = 'copy';
		e.dataTransfer.setDragImage(
			e.currentTarget.querySelector('.pattern__icon') as Element,
			12,
			12
		);

		e.dataTransfer.setData('patternId', pattern.getId());
	}

	@action
	protected handlePatternClick(pattern: Pattern): void {
		const store: Store = Store.getInstance();
		const selectedElement: PageElement | undefined = store.getSelectedElement();
		if (selectedElement) {
			const newPageElement = new PageElement({
				pattern,
				setDefaults: true
			});
			store.execute(ElementCommand.addSibling(selectedElement, newPageElement));
			store.setSelectedElement(newPageElement);
		}
	}

	@action
	protected handleSearchInputChange(evt: React.ChangeEvent<HTMLInputElement>): void {
		Store.getInstance().setPatternSearchTerm(evt.target.value);
	}

	public render(): JSX.Element {
		const store: Store = Store.getInstance();
		const styleguide = store.getStyleguide();
		const patternRoot = styleguide && styleguide.getPatternRoot();
		this.items = patternRoot ? this.createItemsFromFolder(patternRoot) : [];

		if (store.getPatternSearchTerm() !== '') {
			this.items = this.search(this.items, store.getPatternSearchTerm());
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
}
