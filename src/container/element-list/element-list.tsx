import { colors, ElementAnchors } from '../../components';
import { elementMenu } from '../../electron/context-menus';
import { ElementContainer } from './element-container';
import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import * as Store from '../../store';
import styled from 'styled-components';
import * as Types from '../../model/types';

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
export class ElementList extends React.Component {
	private dragImg?: HTMLElement;
	private globalDragEndListener?: (e: DragEvent) => void;
	private globalDropListener?: (e: DragEvent) => void;
	private globalKeyDownListener?: (e: KeyboardEvent) => void;
	private ref: HTMLElement | null;

	public componentDidMount(): void {
		const store = Store.ViewStore.getInstance();
		this.globalKeyDownListener = e => this.handleKeyDown(e);
		this.globalDragEndListener = e => store.unsetDraggedElement();
		this.globalDropListener = this.globalDragEndListener;

		window.addEventListener('keydown', this.globalKeyDownListener);
		window.addEventListener('drop', this.globalDropListener);
		window.addEventListener('dragend', this.globalDragEndListener);
	}

	public componentWillUnmount(): void {
		if (this.globalDropListener) {
			window.removeEventListener('drop', this.globalDropListener);
		}
		if (this.globalDragEndListener) {
			window.removeEventListener('drop', this.globalDragEndListener);
		}
		if (this.globalKeyDownListener) {
			window.removeEventListener('keydown', this.globalKeyDownListener);
		}
	}

	private handleBlur(e: React.FormEvent<HTMLElement>): void {
		const store = Store.ViewStore.getInstance();
		const editableElement = store.getNameEditableElement();

		if (editableElement) {
			store.execute(new Model.ElementNameCommand(editableElement, editableElement.getName()));
			store.setNameEditableElement();
		}
	}

	private handleChange(e: React.FormEvent<HTMLElement>): void {
		const target = e.target as HTMLInputElement;
		const changedElement = elementFromTarget(e.target, { sibling: false });

		if (changedElement) {
			changedElement.setName(target.value);
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
			return;
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
		if (this.dragImg && this.dragImg.parentNode) {
			this.dragImg.parentNode.removeChild(this.dragImg);
		}
	}

	private handleDragLeave(e: React.DragEvent<HTMLElement>): void {
		const targetElement = elementFromTarget(e.target, { sibling: false });

		if (!targetElement) {
			return;
		}

		targetElement.setHighlighted(false);
		targetElement.setPlaceholderHighlighted(false);
	}

	private handleDragOver(e: React.DragEvent<HTMLElement>): void {
		const target = e.target as HTMLElement;
		const isSibling = target.getAttribute(ElementAnchors.placeholder) === 'true';

		const targetParentElement = elementFromTarget(target, { sibling: isSibling });
		const visualTargetElement = elementFromTarget(target, { sibling: false });

		const store = Store.ViewStore.getInstance();
		const draggedElement = store.getDraggedElement();

		if (!targetParentElement || !visualTargetElement) {
			return;
		}

		Mobx.transaction(() => {
			if (!draggedElement) {
				// e.dataTransfer.dropEffect = 'none';
				visualTargetElement.setHighlighted(false);
				visualTargetElement.setPlaceholderHighlighted(false);
				return;
			}

			const accepted = targetParentElement.accepts(draggedElement);

			if (!accepted) {
				// e.dataTransfer.dropEffect = 'none';
				return;
			}

			e.dataTransfer.dropEffect = 'copy';
			visualTargetElement.setHighlighted(!isSibling);
			visualTargetElement.setPlaceholderHighlighted(isSibling);
		});
	}

	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		const store = Store.ViewStore.getInstance();
		const draggedElement = elementFromTarget(e.target, { sibling: false });

		if (!draggedElement) {
			e.preventDefault();
			return;
		}

		if (draggedElement.isNameEditable()) {
			e.preventDefault();
			return;
		}

		const dragImg = document.createElement('div');
		dragImg.textContent = draggedElement.getName();
		dragImg.setAttribute('style', DRAG_IMG_STYLE);
		document.body.appendChild(dragImg);

		e.dataTransfer.effectAllowed = 'copy';
		e.dataTransfer.setDragImage(dragImg, 75, 15);
		this.dragImg = dragImg;

		// tslint:disable-next-line:no-any
		(window as any).requestIdleCallback(() => {
			draggedElement.setDragged(true);
			store.setSelectedElement(draggedElement);
		});
	}

	private handleDrop(e: React.DragEvent<HTMLElement>): void {
		this.handleDragEnd(e);

		const store = Store.ViewStore.getInstance();
		const target = e.target as HTMLElement;
		const isSiblingDrop = target.getAttribute(ElementAnchors.placeholder) === 'true';

		const rawTargetElement = elementFromTarget(e.target, { sibling: false });
		const dropTargetElement = elementFromTarget(e.target, { sibling: isSiblingDrop });
		const dropTargetContent = contentFromTarget(e.target, { sibling: isSiblingDrop });
		const draggedElement = store.getDraggedElement();

		if (!rawTargetElement || !dropTargetElement || !dropTargetContent || !draggedElement) {
			return;
		}

		if (!dropTargetElement.accepts(draggedElement)) {
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

		if (
			store
				.getProject()
				.getElements()
				.some(el => el.getId() === draggedElement.getId())
		) {
			store.addElement(draggedElement);
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
		const element = elementFromTarget(e.target as HTMLElement, { sibling: false });

		if (element) {
			element.setHighlighted(false);
		}
	}

	private handleMouseOver(e: React.MouseEvent<HTMLElement>): void {
		const store = Store.ViewStore.getInstance();
		const element = elementFromTarget(e.target as HTMLElement, { sibling: false });
		const label = above(e.target, `[${ElementAnchors.label}]`);

		if ((label && element) || (!label && element && element.isRoot())) {
			store
				.getProject()
				.getElements()
				.filter(se => se.getHighlighted())
				.forEach(se => se.setHighlighted(false));
		}

		if (label && element) {
			element.setHighlighted(true);
		}
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

		return (
			<StyledDragRoot
				data-drag-root
				{...{ [ElementAnchors.element]: rootElement.getId() }}
				onBlur={e => this.handleBlur(e)}
				onChange={e => this.handleChange(e)}
				onClick={e => this.handleClick(e)}
				onContextMenu={e => this.handleContextMenu(e)}
				onDragEnd={e => this.handleDragEnd(e)}
				onDragLeave={e => this.handleDragLeave(e)}
				onDragOver={e => this.handleDragOver(e)}
				onDragStart={e => this.handleDragStart(e)}
				onDrop={e => this.handleDrop(e)}
				onKeyDown={e => this.handleKeyDown(e.nativeEvent)}
				onMouseLeave={e => this.handleMouseLeave(e)}
				onMouseOver={e => this.handleMouseOver(e)}
				innerRef={ref => (this.ref = ref)}
			>
				<ElementContainer element={rootElement} />
			</StyledDragRoot>
		);
	}
}

const StyledDragRoot = styled.div`
	height: 100%;
	width: 100%;
`;

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
