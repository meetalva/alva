import { colors } from '../../lsg/patterns/colors';
import { elementMenu } from '../../electron/context-menus';
import { ElementLocationCommand } from '../../store/command/element-location-command';
import { ElementWrapper } from './element-wrapper';
import { ListItemProps } from '../../lsg/patterns/list';
import { createMenu } from '../../electron/menu';
import { observer } from 'mobx-react';
import { Page } from '../../store/page/page';
import { PageElement } from '../../store/page/page-element';
import { Pattern } from '../../store/styleguide/pattern';
import * as React from 'react';
import { Slot } from '../../store/styleguide/slot';
import { Store } from '../../store/store';
import * as uuid from 'uuid';

export interface ElementListState {
	dragging: boolean;
}

const DRAG_IMG_STYLE = `
	position: fixed;
	top: 100vh;
	background-color: ${colors.white.toString()};
	color: ${colors.black.toString()};
	padding: 6px 18px;
	border-radius: 3px;
	font-size: 12px;
	opacity: 1;
`;

@observer
export class ElementList extends React.Component<{}, ElementListState> {
	private dragImg?: HTMLElement;

	public state = {
		dragging: true
	};

	public componentDidMount(): void {
		createMenu();
	}

	public componentWillUpdate(): void {
		createMenu();
	}

	public createItemFromElement(
		key: string,
		element: PageElement,
		selectedElement?: PageElement
	): ElementNodeProps {
		const store = Store.getInstance();
		const pattern: Pattern | undefined = element.getPattern();

		if (!pattern) {
			return {
				label: key,
				title: '(invalid)',
				id: uuid.v4(),
				children: [],
				dragging: this.state.dragging
			};
		}

		let defaultSlotItems: ElementNodeProps[] | undefined = [];
		const slots: ElementNodeProps[] = [];

		pattern.getSlots().forEach(slot => {
			const listItem = this.createItemFromSlot(slot, element, selectedElement);

			if (slot.getId() === Pattern.DEFAULT_SLOT_ID) {
				defaultSlotItems = listItem.children;
			} else {
				slots.push(listItem);
			}
		});

		return {
			label: key,
			title: element.getName(),
			dragging: this.state.dragging,
			id: element.getId(),
			onDragDropForChild: (e: React.DragEvent<HTMLElement>) => {
				this.handleDragEnd(e);
				const patternId = e.dataTransfer.getData('patternId');

				const newParent = element.getParent();
				let draggedElement: PageElement | undefined;

				if (!patternId) {
					draggedElement = store.getDraggedElement();
				} else {
					const styleguide = store.getStyleguide();
					if (!styleguide) {
						return;
					}

					draggedElement = new PageElement({
						pattern: styleguide.getPattern(patternId),
						setDefaults: true
					});
				}

				if (!newParent || !draggedElement || draggedElement.isAncestorOf(newParent)) {
					return;
				}

				let newIndex = element.getIndex();
				if (draggedElement.getParent() === newParent) {
					const currentIndex = draggedElement.getIndex();
					if (newIndex > currentIndex) {
						newIndex--;
					}
					if (newIndex === currentIndex) {
						return;
					}
				}

				store.execute(
					ElementLocationCommand.addChild(
						newParent,
						draggedElement,
						element.getParentSlotId(),
						newIndex
					)
				);
				store.setSelectedElement(draggedElement);
			},
			onDragDrop: (e: React.DragEvent<HTMLElement>) => {
				this.handleDragEnd(e);
				const patternId = e.dataTransfer.getData('patternId');

				let draggedElement: PageElement | undefined;

				if (!patternId) {
					draggedElement = store.getDraggedElement();
				} else {
					const styleguide = store.getStyleguide();

					if (!styleguide) {
						return;
					}

					draggedElement = new PageElement({
						pattern: styleguide.getPattern(patternId),
						setDefaults: true
					});
				}

				if (!draggedElement || draggedElement.isAncestorOf(element)) {
					return;
				}

				store.execute(ElementLocationCommand.addChild(element, draggedElement));
				store.setSelectedElement(draggedElement);
			},
			children: [...slots, ...defaultSlotItems],
			active: element === selectedElement && !store.getSelectedSlotId()
		};
	}

	public createItemFromSlot(
		slot: Slot,
		element: PageElement,
		selectedElement?: PageElement
	): ElementNodeProps {
		const store = Store.getInstance();
		const slotId = slot.getId();
		const slotContents: PageElement[] = element.getSlotContents(slotId);
		const childItems: ElementNodeProps[] = [];
		const selectedSlot = store.getSelectedSlotId();

		slotContents.forEach((value: PageElement, index: number) => {
			childItems.push(
				this.createItemFromElement(
					slotContents.length > 1 ? `Child ${index + 1}` : 'Child',
					value,
					selectedElement
				)
			);
		});

		const updateSelectedSlot: React.MouseEventHandler<HTMLElement> = event => {
			event.stopPropagation();
			store.setSelectedElement(element);
			store.setSelectedSlot(slotId);
			store.setElementFocussed(false);
		};

		const slotListItem: ElementNodeProps = {
			id: slot.getId(),
			title: `\uD83D\uDD18 ${slot.getName()}`,
			draggable: false,
			dragging: this.state.dragging,
			children: childItems,
			label: slotId,
			onClick: updateSelectedSlot,
			onDragDrop: (e: React.DragEvent<HTMLElement>) => {
				const patternId = e.dataTransfer.getData('patternId');

				let draggedElement: PageElement | undefined;

				if (!patternId) {
					draggedElement = store.getDraggedElement();
				} else {
					const styleguide = store.getStyleguide();

					if (!styleguide) {
						return;
					}

					draggedElement = new PageElement({
						pattern: styleguide.getPattern(patternId),
						setDefaults: true
					});
				}

				if (!draggedElement) {
					return;
				}

				store.execute(ElementLocationCommand.addChild(element, draggedElement, slotId));
				store.setSelectedElement(draggedElement);
			},
			active: element === selectedElement && selectedSlot === slotId
		};

		return slotListItem;
	}

	private handleClick(e: React.MouseEvent<HTMLElement>): void {
		const element = elementFromTarget(e.target);
		e.stopPropagation();
		Store.getInstance().setSelectedElement(element);
		Store.getInstance().setElementFocussed(true);
	}

	private handleContextMenu(e: React.MouseEvent<HTMLElement>): void {
		const element = elementFromTarget(e.target);
		if (element) {
			elementMenu(element);
		}
	}

	private handleDragEnd(e: React.DragEvent<HTMLElement>): void {
		this.setState({ dragging: false });

		if (this.dragImg && this.dragImg.parentNode) {
			this.dragImg.parentNode.removeChild(this.dragImg);
		}
	}

	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		this.setState({ dragging: true });
		const element = elementFromTarget(e.target);

		if (element) {
			Store.getInstance().setDraggedElement(element);
			const dragImg = document.createElement('div');
			dragImg.textContent = element.getName();
			dragImg.setAttribute('style', DRAG_IMG_STYLE);
			document.body.appendChild(dragImg);
			e.dataTransfer.setDragImage(dragImg, 75, 15);
			this.dragImg = dragImg;
		}
	}

	private handleMouseLeave(e: React.MouseEvent<HTMLElement>): void {
		this.setState({ dragging: true });
	}

	private handleMouseOver(e: React.MouseEvent<HTMLElement>): void {
		this.setState({ dragging: false });
	}

	public render(): JSX.Element | null {
		const store = Store.getInstance();
		const page: Page | undefined = store.getCurrentPage();

		if (!page) {
			return null;
		}

		const rootElement = page.getRoot();

		if (!rootElement) {
			return null;
		}

		const selectedElement = store.getSelectedElement();
		const item = this.createItemFromElement('Root', rootElement, selectedElement);

		return (
			<div
				data-drag-root
				onClick={e => this.handleClick(e)}
				onContextMenu={e => this.handleContextMenu(e)}
				onDragStart={e => this.handleDragStart(e)}
				onDragEnd={e => this.handleDragEnd(e)}
				onMouseOver={e => this.handleMouseOver(e)}
				onMouseLeave={e => this.handleMouseLeave(e)}
			>
				<ElementTree {...item} dragging={this.state.dragging} />
			</div>
		);
	}
}

export interface ElementNodeProps extends ListItemProps {
	children?: ElementNodeProps[];
	dragging: boolean;
	id: string;
}

function ElementTree(props: ElementNodeProps): JSX.Element {
	const children = Array.isArray(props.children) ? props.children : [];

	return (
		<ElementWrapper {...props} dragging={props.dragging}>
			{children.map(child => (
				<ElementTree {...child} key={child.id} dragging={props.dragging} />
			))}
		</ElementWrapper>
	);
}

function above(node: EventTarget, selector: string): HTMLElement | null {
	let el = node as HTMLElement;
	let ended = false;

	while (el && !ended) {
		if (el.matches(selector)) {
			break;
		}

		if (el.parentElement !== null) {
			el = el.parentElement;
		} else {
			ended = true;
			break;
		}
	}

	return ended ? null : el;
}

function elementFromTarget(target: EventTarget): PageElement | undefined {
	const el = above(target, '[data-id]');

	if (!el) {
		return;
	}

	const id = el.getAttribute('data-id');

	if (typeof id !== 'string') {
		return;
	}

	const store = Store.getInstance();
	const page = store.getCurrentPage();

	if (!page) {
		return;
	}

	return page.getElementById(id);
}
