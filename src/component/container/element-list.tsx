import { colors } from '../../lsg/patterns/colors';
import { elementMenu } from '../../electron/context-menus';
import { ElementAnchors, ElementProps } from '../../lsg/patterns/element';
import { ElementLocationCommand } from '../../store/command/element-location-command';
import { ElementNameCommand } from '../../store/command/element-name-command';
import { ElementWrapper } from './element-wrapper';
import { createMenu } from '../../electron/menu';
import { observer } from 'mobx-react';
import { Page } from '../../store/page/page';
import { PageElement } from '../../store/page/page-element';
import { Pattern } from '../../store/styleguide/pattern';
import * as React from 'react';
import { Slot } from '../../store/styleguide/slot';
import { Store } from '../../store/store';
import { Styleguide } from '../../store/styleguide/styleguide';
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
	private globalKeyDownListener?: (e: KeyboardEvent) => void;
	private ref: HTMLElement | null;

	public state = {
		dragging: true
	};

	public componentDidMount(): void {
		createMenu();

		this.globalKeyDownListener = e => this.handleKeyDown(e);
		window.addEventListener('keydown', this.globalKeyDownListener);
	}

	public componentWillUnmount(): void {
		if (this.globalKeyDownListener) {
			window.removeEventListener('keydown', this.globalKeyDownListener);
		}
	}

	public componentWillUpdate(): void {
		createMenu();
	}

	public createItemFromElement(
		element: PageElement,
		selectedElement?: PageElement
	): ElementNodeProps {
		const store = Store.getInstance();
		const pattern: Pattern | undefined = element.getPattern();

		if (!pattern) {
			return {
				title: '(invalid)',
				id: uuid.v4(),
				children: [],
				draggable: false,
				dragging: this.state.dragging
			};
		}

		let defaultSlotItems: ElementNodeProps[] | undefined = [];
		const slots: ElementNodeProps[] = [];

		pattern.getSlots().forEach(slot => {
			const listItem = this.createItemFromSlot(slot, element, selectedElement);

			if (slot.getId() === Pattern.DEFAULT_SLOT_PROPERTY_NAME) {
				defaultSlotItems = listItem.children;
			} else {
				slots.push(listItem);
			}
		});

		return {
			title: element.getName(),
			draggable: !element.isNameEditable(),
			dragging: this.state.dragging,
			editable: element.isNameEditable(),
			id: element.getId(),
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
			childItems.push(this.createItemFromElement(value, selectedElement));
		});

		const slotListItem: ElementNodeProps = {
			id: slot.getId(),
			title: `\uD83D\uDD18 ${slot.getName()}`,
			editable: false,
			draggable: false,
			dragging: this.state.dragging,
			children: childItems,
			// TODO: Unify this with the event-delegation based drag/drop handling
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

	private handleBlur(e: React.FormEvent<HTMLElement>): void {
		const store = Store.getInstance();
		const editableElement = store.getNameEditableElement();

		if (editableElement) {
			store.execute(new ElementNameCommand(editableElement, editableElement.getName()));
			store.setNameEditableElement();
		}
	}

	private handleClick(e: React.MouseEvent<HTMLElement>): void {
		const element = elementFromTarget(e.target);
		const store = Store.getInstance();
		const label = above(e.target, `[${ElementAnchors.label}]`);

		if (!element) {
			return;
		}

		e.stopPropagation();

		if (store.getSelectedElement() === element && label) {
			store.setNameEditableElement(element);
		}

		if (store.getSelectedElement() !== element) {
			store.setSelectedElement(element);
			store.setElementFocussed(true);
		}
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

		if (!element) {
			return;
		}

		if (element.isNameEditable()) {
			return;
		}

		Store.getInstance().setDraggedElement(element);
		const dragImg = document.createElement('div');
		dragImg.textContent = element.getName();
		dragImg.setAttribute('style', DRAG_IMG_STYLE);
		document.body.appendChild(dragImg);
		e.dataTransfer.setDragImage(dragImg, 75, 15);
		this.dragImg = dragImg;
	}

	private handleDrop(e: React.DragEvent<HTMLElement>): void {
		this.handleDragEnd(e);

		const store = Store.getInstance();
		const styleguide = store.getStyleguide() as Styleguide;
		const patternId = e.dataTransfer.getData('patternId');
		const dropTargetElement = elementFromTarget(e.target);
		const newParent = dropTargetElement
			? dropTargetElement.getParent() || dropTargetElement
			: undefined;
		const isPlaceholder =
			(e.target as HTMLElement).getAttribute(ElementAnchors.placeholder) === 'true';

		const draggedElement =
			store.getDraggedElement() ||
			new PageElement({
				pattern: styleguide.getPattern(patternId),
				setDefaults: true
			});

		// TODO: The ancestor check should be performed for drag starts to show no drop
		// indication for impossible drop operations
		if (!dropTargetElement || !newParent || draggedElement.isAncestorOf(newParent)) {
			return;
		}

		if (isPlaceholder) {
			const dropIndex = calculateDropIndex(dropTargetElement, draggedElement);

			if (dropIndex === draggedElement.getIndex()) {
				return;
			}

			store.execute(
				ElementLocationCommand.addChild(
					newParent,
					draggedElement,
					dropTargetElement.getParentSlotId(),
					dropIndex
				)
			);
		} else {
			store.execute(ElementLocationCommand.addChild(dropTargetElement, draggedElement));
		}

		store.setSelectedElement(draggedElement);
	}

	private handleKeyDown(e: KeyboardEvent): void {
		const store = Store.getInstance();
		const node = e.target as Node;
		const contains = (target: Node) => (this.ref ? this.ref.contains(target) : false);

		// Only handle key events if either
		// (1) it is global, thus fires on body
		// (2) is a node inside the page element list
		if (e.target !== document.body && !contains(node)) {
			return;
		}

		switch (e.keyCode) {
			case 13: {
				// ENTER
				e.stopPropagation();

				const editableElement = store.getNameEditableElement();
				const selectedElement = store.getSelectedElement();

				if (editableElement) {
					store.execute(new ElementNameCommand(editableElement, editableElement.getName()));
					store.setNameEditableElement();
				} else {
					store.setNameEditableElement(selectedElement);
				}
				break;
			}
			case 27: {
				// ESC
				e.stopPropagation();

				const editableElement = store.getNameEditableElement();

				if (editableElement) {
					const name = editableElement.getName({ unedited: true });
					store.setNameEditableElement();
					editableElement.setName(name);
				}
			}
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
		const item = this.createItemFromElement(rootElement, selectedElement);

		return (
			<div
				data-drag-root
				onBlur={e => this.handleBlur(e)}
				onClick={e => this.handleClick(e)}
				onContextMenu={e => this.handleContextMenu(e)}
				onDragEnd={e => this.handleDragEnd(e)}
				onDragStart={e => this.handleDragStart(e)}
				onDrop={e => this.handleDrop(e)}
				onKeyDown={e => this.handleKeyDown(e.nativeEvent)}
				onMouseLeave={e => this.handleMouseLeave(e)}
				onMouseOver={e => this.handleMouseOver(e)}
				ref={ref => (this.ref = ref)}
			>
				<ElementTree {...item} dragging={this.state.dragging} />
			</div>
		);
	}
}

export interface ElementNodeProps extends ElementProps {
	children?: ElementNodeProps[];
	draggable: boolean;
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
	const el = above(target, `[${ElementAnchors.element}]`);

	if (!el) {
		return;
	}

	const id = el.getAttribute(ElementAnchors.element);

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

function calculateDropIndex(target: PageElement, dragged: PageElement): number {
	// We definitely know the drop target has a parent, thus an index
	const newIndex = target.getIndex() as number;

	// The dragged element is dropped into another
	// leaf list than it was dragged from.
	// True for (1) new elements, (2) elements dragged to other parents
	if (dragged.getParent() !== target.getParent()) {
		return newIndex;
	}

	// If the dragged element has a parent, it has an index
	const currentIndex = dragged.getParent() ? (dragged.getIndex() as number) : -1;

	// The dragged element is dropped in the same leaf
	// list as it was dragged from.
	// Offset the index by the element itself missing from the new list.
	if (newIndex > currentIndex) {
		return newIndex - 1;
	}

	return newIndex;
}
