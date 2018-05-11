import { colors, ElementAnchors, ElementProps } from '../../components';
import { elementMenu } from '../../electron/context-menus';
import { ElementWrapper } from './element-wrapper';
import { partition } from 'lodash';
import { createMenu } from '../../electron/menu';
import { observer } from 'mobx-react';
import * as React from 'react';
import * as Store from '../../store';
import * as Types from '../../store/types';
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

	public createItemFromElement(element: Store.PageElement): ElementNodeProps {
		const store = Store.ViewStore.getInstance();
		const pattern: Store.Pattern | undefined = element.getPattern();

		if (!pattern) {
			return {
				title: '(invalid)',
				id: uuid.v4(),
				children: [],
				draggable: false,
				dragging: this.state.dragging
			};
		}

		const createSlot = slot => this.createItemFromSlot(slot, element);
		const [[defaultSlotData], slotsData] = partition(
			pattern.getSlots(),
			slot => slot.getType() === Types.SlotType.Children
		);

		const children = createSlot(defaultSlotData).children as ElementNodeProps[];
		const slots = slotsData.map(createSlot);

		return {
			title: element.getName(),
			draggable: !element.isNameEditable(),
			dragging: this.state.dragging,
			editable: element.isNameEditable(),
			id: element.getId(),
			children: [...slots, ...children],
			active: store.getSelectedElement() === element
		};
	}

	public createItemFromSlot(slot: Store.Slot, element: Store.PageElement): ElementNodeProps {
		const slotContent = element.getContentBySlot(slot) as Store.PageElementContent;

		const slotListItem: ElementNodeProps = {
			id: slot.getId(),
			title: `\uD83D\uDD18 ${slot.getName()}`,
			editable: false,
			draggable: false,
			dragging: this.state.dragging,
			children: slotContent.getElements().map(value => this.createItemFromElement(value)),
			active: false
		};

		return slotListItem;
	}

	private handleBlur(e: React.FormEvent<HTMLElement>): void {
		const store = Store.ViewStore.getInstance();
		const editableElement = store.getNameEditableElement();

		if (editableElement) {
			store.execute(new Store.ElementNameCommand(editableElement, editableElement.getName()));
			store.setNameEditableElement();
		}
	}

	private handleClick(e: React.MouseEvent<HTMLElement>): void {
		const element = elementFromTarget(e.target);
		const store = Store.ViewStore.getInstance();
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
		const element = elementFromTarget(e.target);

		if (!element) {
			e.preventDefault();
			return;
		}

		if (element.isNameEditable()) {
			e.preventDefault();
			return;
		}

		this.setState({ dragging: true });

		const dragImg = document.createElement('div');
		dragImg.textContent = element.getName();
		dragImg.setAttribute('style', DRAG_IMG_STYLE);
		document.body.appendChild(dragImg);
		e.dataTransfer.setDragImage(dragImg, 75, 15);
		e.dataTransfer.setData('elementId', element.getId());
		this.dragImg = dragImg;
	}

	private handleDrop(e: React.DragEvent<HTMLElement>): void {
		this.handleDragEnd(e);

		const store = Store.ViewStore.getInstance();
		const patternId = e.dataTransfer.getData('patternId');
		const elementId = e.dataTransfer.getData('elementId');

		const pattern = store.getPatternById(patternId);
		const element = store.getElementById(elementId);

		if (!pattern && !element) {
			return;
		}

		const isSiblingDrop =
			(e.target as HTMLElement).getAttribute(ElementAnchors.placeholder) === 'true';
		const targetElement = elementFromTarget(e.target);

		if (!targetElement) {
			return;
		}

		const getDropParent = (el: Store.PageElement): Store.PageElement => {
			if (!isSiblingDrop) {
				return el;
			}

			if (el.isRoot()) {
				return el;
			}

			return el.getParent() as Store.PageElement;
		};

		const dropParent = getDropParent(targetElement);

		// prettier-ignore
		const draggedElement = pattern
			? // drag from pattern list, create new element
			new Store.PageElement({
					contents: [],
					pattern,
					setDefaults: true
			})
			: // drag from element list, obtain reference
			store.getElementById(elementId);

		if (!draggedElement) {
			return;
		}

		const dropContainer = dropParent.getContentBySlotType(
			Types.SlotType.Children
		) as Store.PageElementContent;

		const command = Store.ElementLocationCommand.addChild({
			parent: dropParent,
			child: draggedElement,
			slotId: dropContainer.getSlotId(),
			index: isSiblingDrop
				? calculateDropIndex({ target: targetElement, dragged: draggedElement })
				: dropContainer.getElements().length
		});

		store.execute(command);
		store.setSelectedElement(draggedElement);
	}

	private handleKeyDown(e: KeyboardEvent): void {
		const store = Store.ViewStore.getInstance();
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
					store.execute(
						new Store.ElementNameCommand(editableElement, editableElement.getName())
					);
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
		const store = Store.ViewStore.getInstance();
		const page: Store.Page | undefined = store.getCurrentPage();

		if (!page) {
			return null;
		}

		const rootElement = page.getRoot();

		if (!rootElement) {
			return null;
		}

		const item = this.createItemFromElement(rootElement);

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

function elementFromTarget(target: EventTarget): Store.PageElement | undefined {
	const el = above(target, `[${ElementAnchors.element}]`);

	if (!el) {
		return;
	}

	const id = el.getAttribute(ElementAnchors.element);

	if (typeof id !== 'string') {
		return;
	}

	const store = Store.ViewStore.getInstance();
	return store.getElementById(id);
}

function calculateDropIndex(init: {
	dragged: Store.PageElement;
	target: Store.PageElement;
}): number {
	const { dragged, target } = init;

	// We definitely know the drop target has a parent, thus an index
	const newIndex = target.getIndex() as number;

	// The dragged element is dropped into another
	// leaf list than it was dragged from.
	// True for (1) new elements, (2) elements dragged to other parents
	if (dragged.getContainer() !== target.getContainer()) {
		return newIndex;
	}

	// If the dragged element has a parent, it has an index
	const currentIndex = dragged.getIndex();

	// The dragged element is dropped in the same leaf
	// list as it was dragged from.
	// Offset the index by the element itself missing from the new list.
	if (newIndex > currentIndex) {
		return newIndex - 1;
	}

	return newIndex;
}
