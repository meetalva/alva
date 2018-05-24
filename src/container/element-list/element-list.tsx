import { colors, ElementAnchors, ElementProps } from '../../components';
import { elementMenu } from '../../electron/context-menus';
import { ElementWrapper } from './element-wrapper';
import { partition } from 'lodash';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import * as Store from '../../store';
import styled from 'styled-components';
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
		this.globalKeyDownListener = e => this.handleKeyDown(e);
		window.addEventListener('keydown', this.globalKeyDownListener);
	}

	public componentWillUnmount(): void {
		if (this.globalKeyDownListener) {
			window.removeEventListener('keydown', this.globalKeyDownListener);
		}
	}

	public createItemFromElement(element: Model.Element): ElementNodeProps {
		const store = Store.ViewStore.getInstance();
		const pattern: Model.Pattern | undefined = element.getPattern();
		const selectedElement = store.getSelectedElement();
		const open = element.getDescendants().some(e => e === selectedElement);

		if (!pattern) {
			return {
				active: store.getSelectedElement() === element,
				children: [],
				draggable: false,
				dragging: this.state.dragging,
				editable: false,
				id: element.getId(),
				open,
				title: `Invalid: ${element.getName()}`
			};
		}

		const createSlot = slot => this.createItemFromSlot(slot, element);

		const [[defaultSlotData], slotsData] = partition(
			pattern.getSlots(),
			slot => slot.getType() === Types.SlotType.Children
		);

		const defaultSlot = defaultSlotData ? createSlot(defaultSlotData) : { children: [] };
		const children = defaultSlot && defaultSlot.children ? Array.from(defaultSlot.children) : [];

		const slots = slotsData
			.map(createSlot)
			.filter((s): s is ElementNodeProps => typeof s !== 'undefined');

		return {
			active: store.getSelectedElement() === element,
			children: [...slots, ...children],
			draggable: !element.isNameEditable(),
			dragging: this.state.dragging,
			editable: element.isNameEditable(),
			id: element.getId(),
			title: element.getName(),
			open: element.getOpen() || element.getDescendants().some(e => e === selectedElement)
		};
	}

	public createItemFromSlot(
		slot: Model.PatternSlot,
		element: Model.Element
	): ElementNodeProps | undefined {
		const slotContent = element.getContentBySlotId(slot.getId());

		if (!slotContent) {
			return;
		}

		const slotListItem: ElementNodeProps = {
			id: slotContent.getId(),
			title: slot.getName(),
			editable: false,
			draggable: false,
			dragging: this.state.dragging,
			children: slotContent.getElements().map(e => this.createItemFromElement(e)),
			active: false,
			open: true
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
		const target = e.target as HTMLElement;
		const icon = above(target, `svg[${ElementAnchors.icon}]`);

		// Skip and deselect elements if the root itself is clicked
		if (target.getAttribute('data-drag-root')) {
			return;
		}

		const element = elementFromTarget(e.target, { sibling: false });
		const store = Store.ViewStore.getInstance();
		const label = above(e.target, `[${ElementAnchors.label}]`);

		if (!element) {
			return;
		}

		e.stopPropagation();

		if (icon) {
			element.toggleOpen();
		}

		if (store.getSelectedElement() === element && label) {
			store.setNameEditableElement(element);
		}

		if (store.getSelectedElement() !== element) {
			store.setSelectedElement(element);
		}
	}

	private handleContextMenu(e: React.MouseEvent<HTMLElement>): void {
		const element = elementFromTarget(e.target, { sibling: false });
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
		const element = elementFromTarget(e.target, { sibling: false });

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

		const target = e.target as HTMLElement;
		const patternId = e.dataTransfer.getData('patternId');
		const elementId = e.dataTransfer.getData('elementId');
		const isSiblingDrop = target.getAttribute(ElementAnchors.placeholder) === 'true';

		const store = Store.ViewStore.getInstance();
		const pattern = store.getPatternById(patternId);
		const element = store.getElementById(elementId);

		if (!element && !pattern) {
			return;
		}

		const rawTargetElement = elementFromTarget(e.target, { sibling: false });
		const dropTargetElement = elementFromTarget(e.target, { sibling: isSiblingDrop });
		const dropTargetContent = contentFromTarget(e.target, { sibling: isSiblingDrop });

		if (!rawTargetElement || !dropTargetElement || !dropTargetContent) {
			return;
		}

		// prettier-ignore
		const draggedElement = pattern
			? // drag from pattern list, create new element
			store.addNewElement({pattern})
			: // drag from element list, obtain reference
			store.getElementById(elementId);

		if (!draggedElement) {
			return;
		}

		if (draggedElement.isAncestorOfById(dropTargetElement.getId())) {
			return;
		}

		const getDropIndex = () => {
			if (!isSiblingDrop) {
				return dropTargetContent.getElements().length;
			}
			return calculateDropIndex({
				target: rawTargetElement,
				dragged: draggedElement
			});
		};

		const index = getDropIndex();

		if (index === -1) {
			return;
		}

		const command = Model.ElementLocationCommand.addChild({
			childId: draggedElement.getId(),
			contentId: dropTargetContent.getId(),
			index
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
			<StyledDragRoot
				data-drag-root
				{...{ [ElementAnchors.element]: rootElement.getId() }}
				onBlur={e => this.handleBlur(e)}
				onClick={e => this.handleClick(e)}
				onContextMenu={e => this.handleContextMenu(e)}
				onDragEnd={e => this.handleDragEnd(e)}
				onDragStart={e => this.handleDragStart(e)}
				onDrop={e => this.handleDrop(e)}
				onKeyDown={e => this.handleKeyDown(e.nativeEvent)}
				onMouseLeave={e => this.handleMouseLeave(e)}
				onMouseOver={e => this.handleMouseOver(e)}
				innerRef={ref => (this.ref = ref)}
			>
				<ElementTree {...item} dragging={this.state.dragging} />
			</StyledDragRoot>
		);
	}
}

const StyledDragRoot = styled.div`
	height: 100%;
	width: 100%;
`;

export interface ElementNodeProps extends ElementProps {
	children?: ElementNodeProps[];
	draggable: boolean;
	dragging: boolean;
	id: string;
	open: boolean;
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

function contentFromTarget(
	target: EventTarget,
	options: { sibling: boolean }
): Model.ElementContent | undefined {
	const el = above(target, `[${ElementAnchors.content}]`);

	if (!el) {
		return;
	}

	const id = el.getAttribute(ElementAnchors.element);

	if (typeof id !== 'string') {
		return;
	}

	const store = Store.ViewStore.getInstance();
	const content = store.getContentById(id);
	const element = store.getElementById(id);

	if (content) {
		return content;
	}

	if (!element) {
		return;
	}

	const base = options.sibling ? element.getParent() : element;

	if (!base) {
		return;
	}

	return base.getContentBySlotType(Types.SlotType.Children);
}

function elementFromTarget(
	target: EventTarget,
	options: { sibling: boolean }
): Model.Element | undefined {
	const el = above(target, `[${ElementAnchors.element}]`);

	if (!el) {
		return;
	}

	const id = el.getAttribute(ElementAnchors.element);

	if (typeof id !== 'string') {
		return;
	}

	const store = Store.ViewStore.getInstance();
	const element = store.getElementById(id);

	if (!element) {
		return;
	}

	return options.sibling ? element.getParent() : element;
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
