import { colors, ElementAnchors, ElementProps } from '../../components';
import { elementMenu } from '../../electron/context-menus';
import { ElementWrapper } from './element-wrapper';
import { partition } from 'lodash';
import { createMenu } from '../../electron/menu';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import * as Store from '../../store';
import * as Types from '../../model/types';

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

@MobxReact.observer
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

	public createItemFromElement(element: Model.Element): ElementNodeProps {
		const store = Store.ViewStore.getInstance();
		const pattern: Model.Pattern | undefined = element.getPattern();

		if (!pattern) {
			return {
				active: store.getSelectedElement() === element,
				children: [],
				draggable: false,
				dragging: this.state.dragging,
				editable: false,
				id: element.getId(),
				title: `Invalid: ${element.getName()}`
			};
		}

		const createSlot = slot => this.createItemFromSlot(slot, element);

		const [[defaultSlotData], slotsData] = partition(
			pattern.getSlots(),
			slot => slot.getType() === Types.SlotType.Children
		);

		const children = defaultSlotData
			? (createSlot(defaultSlotData).children as ElementNodeProps[])
			: [];

		const slots = slotsData.map(createSlot);

		return {
			active: store.getSelectedElement() === element,
			children: [...slots, ...children],
			draggable: !element.isNameEditable(),
			dragging: this.state.dragging,
			editable: element.isNameEditable(),
			id: element.getId(),
			title: element.getName()
		};
	}

	public createItemFromSlot(slot: Model.PatternSlot, element: Model.Element): ElementNodeProps {
		const slotContent = element.getContentBySlot(slot) as Model.ElementContent;

		const slotListItem: ElementNodeProps = {
			id: slotContent.getId(),
			title: slot.getName(),
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
			store.execute(new Model.ElementNameCommand(editableElement, editableElement.getName()));
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
		const targetContent = contentFromTarget(e.target);

		if (!targetElement && !targetContent) {
			return;
		}

		// prettier-ignore
		const draggedElement = pattern
			? // drag from pattern list, create new element
			new Model.Element({
				contents: [],
				pattern,
				properties: [],
				setDefaults: true
			})
			: // drag from element list, obtain reference
			store.getElementById(elementId);

		if (!draggedElement) {
			return;
		}

		const getDropParent = (el?: Model.Element): Model.Element | undefined => {
			if (!el && targetContent) {
				return store.getElementById(targetContent.getElementId()) as Model.Element;
			}

			if (!el) {
				return;
			}

			if (!isSiblingDrop) {
				return el;
			}

			if (el.isRoot()) {
				return el;
			}

			return el.getParent() as Model.Element;
		};

		const dropParent = getDropParent(targetElement) as Model.Element;
		const dropContainer =
			targetContent || dropParent.getContentBySlotType(Types.SlotType.Children);

		if (!dropContainer) {
			return;
		}

		const command = Model.ElementLocationCommand.addChild({
			parent: dropParent,
			child: draggedElement,
			slotId: dropContainer.getSlotId(),
			index: isSiblingDrop
				? calculateDropIndex({
						target: targetElement as Model.Element,
						dragged: draggedElement
				  })
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
						new Model.ElementNameCommand(editableElement, editableElement.getName())
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
		const page: Model.Page | undefined = store.getCurrentPage();

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

function contentFromTarget(target: EventTarget): Model.ElementContent | undefined {
	const el = above(target, `[${ElementAnchors.content}]`);

	if (!el) {
		return;
	}

	const id = el.getAttribute(ElementAnchors.element);

	if (typeof id !== 'string') {
		return;
	}

	const store = Store.ViewStore.getInstance();
	return store.getContentById(id);
}

function elementFromTarget(target: EventTarget): Model.Element | undefined {
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

function calculateDropIndex(init: { dragged: Model.Element; target: Model.Element }): number {
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
