import * as Components from '../../components';
import { ElementDragImage } from '../element-drag-image';
import { ElementContentContainer } from './element-content-container';
import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import * as Store from '../../store';
import styled from 'styled-components';
import * as Types from '../../types';

@MobxReact.inject('store')
@MobxReact.observer
export class ElementList extends React.Component {
	private dragImg: HTMLElement | null;
	private globalDragEndListener?: (e: DragEvent) => void;
	private globalDropListener?: (e: DragEvent) => void;
	private globalKeyDownListener?: (e: KeyboardEvent) => void;
	private ref: HTMLElement | null;

	public componentDidMount(): void {
		const { store } = this.props as { store: Store.ViewStore };
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
		const { store } = this.props as { store: Store.ViewStore };
		const editableElement = store.getNameEditableElement();

		if (editableElement) {
			store.executeElementRename(editableElement);
			store.setNameEditableElement();
		}
	}

	private handleChange(e: React.FormEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const target = e.target as HTMLInputElement;
		const changedElement = elementFromTarget(e.target, { sibling: false, store });

		if (changedElement) {
			changedElement.setName(target.value);
		}
	}

	private handleClick(e: React.MouseEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };

		const target = e.target as HTMLElement;
		const icon = above(target, `svg[${Components.ElementAnchors.icon}]`);

		// Skip and deselect elements if the root itself is clicked
		if (target.getAttribute('data-drag-root')) {
			store.getProject().unsetSelectedElement();
			return;
		}

		const element = elementFromTarget(e.target, { sibling: false, store });
		const targetContent = elementContentFromTarget(e.target, { store });
		const label = above(e.target, `[${Components.ElementAnchors.label}]`);

		if (!element) {
			return;
		}

		e.stopPropagation();

		if (targetContent && targetContent.getSlotType() !== Types.SlotType.Children) {
			targetContent.toggleOpen();
			return;
		}

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
		const { store } = this.props as { store: Store.ViewStore };
		const element = elementFromTarget(e.target, { sibling: false, store });

		if (element) {
			store.requestContextMenu({
				menu: Types.ContextMenuType.ElementMenu,
				data: {
					element: element.toJSON(),
					project: store.getProject().toJSON()
				}
			});
		}
	}

	private handleDragLeave(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const targetElement = elementFromTarget(e.target, { sibling: false, store });

		if (!targetElement) {
			return;
		}

		targetElement.setHighlighted(false);
		targetElement.setPlaceholderHighlighted(false);
	}

	private handleDragOver(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };

		const target = e.target as HTMLElement;
		const isSibling = target.getAttribute(Components.ElementAnchors.placeholder) === 'true';
		const visualTargetElement = elementFromTarget(e.target, { sibling: false, store });

		const targetContent = isSibling
			? visualTargetElement && visualTargetElement.getContainer()
			: elementContentFromTarget(e.target, { store });

		const draggedElement = store.getDraggedElement();

		if (!targetContent || !visualTargetElement) {
			return;
		}

		Mobx.transaction(() => {
			if (!draggedElement) {
				targetContent.setHighlighted(false);
				visualTargetElement.setPlaceholderHighlighted(false);
				return;
			}

			store
				.getProject()
				.getElementContents()
				.filter(sec => sec.getHighlighted() && sec !== targetContent)
				.forEach(se => se.setHighlighted(false));

			store
				.getProject()
				.getElements()
				.filter(se => se.getHighlighted() && se !== visualTargetElement)
				.forEach(se => se.setHighlighted(false));

			const accepted = targetContent.accepts(draggedElement);

			if (!accepted) {
				targetContent.setHighlighted(false);
				visualTargetElement.setPlaceholderHighlighted(false);
				return;
			}

			e.dataTransfer.dropEffect = 'copy';
			targetContent.setHighlighted(!isSibling);
			visualTargetElement.setPlaceholderHighlighted(isSibling);
		});
	}

	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const draggedElement = elementFromTarget(e.target, { sibling: false, store });

		if (!draggedElement) {
			e.preventDefault();
			return;
		}

		if (draggedElement.getRole() === Types.ElementRole.Root) {
			e.preventDefault();
			return;
		}

		if (draggedElement.getNameEditable()) {
			e.preventDefault();
			return;
		}

		draggedElement.setDragged(true);
		store.setSelectedElement(draggedElement);

		if (this.dragImg) {
			e.dataTransfer.effectAllowed = 'copy';
			e.dataTransfer.setDragImage(this.dragImg, 75, 15);
		}
	}

	private handleDrop(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };

		const target = e.target as HTMLElement;
		const isSiblingDrop = target.getAttribute(Components.ElementAnchors.placeholder) === 'true';

		const draggedElement = store.getDraggedElement();
		const visualTargetElement = elementFromTarget(e.target, { sibling: false, store });

		if (!draggedElement || !visualTargetElement) {
			return;
		}

		const targetContent = isSiblingDrop
			? visualTargetElement.getContainer()
			: elementContentFromTarget(e.target, { store });

		if (!targetContent) {
			return;
		}

		const getDropIndex = () => {
			if (!isSiblingDrop) {
				return targetContent.getElements().length;
			}
			return calculateDropIndex({
				target: visualTargetElement,
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

		store.executeElementMove({
			element: draggedElement,
			content: targetContent,
			index
		});
	}

	private handleKeyDown(e: KeyboardEvent): void {
		const { store } = this.props as { store: Store.ViewStore };
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
					store.executeElementRename(editableElement);
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
		const { store } = this.props as { store: Store.ViewStore };
		const element = elementFromTarget(e.target as HTMLElement, { sibling: false, store });
		const targetContent = elementContentFromTarget(e.target, { store });

		if (targetContent) {
			targetContent.setHighlighted(false);
		}

		if (element) {
			element.setHighlighted(false);
		}
	}

	private handleMouseOver(e: React.MouseEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const targetElement = elementFromTarget(e.target as HTMLElement, { sibling: false, store });
		const targetContent = elementContentFromTarget(e.target, { store });
		const label = above(e.target, `[${Components.ElementAnchors.label}]`);

		Mobx.transaction(() => {
			if (
				(label && targetElement) ||
				(label && targetContent) ||
				(!label && targetElement && targetElement.getRole() === Types.ElementRole.Root)
			) {
				store.getProject().unsetHighlightedElement();
				store.getProject().unsetHighlightedElementContent();
			}

			if (
				label &&
				targetElement &&
				targetContent === targetElement.getContentBySlotId(Types.SlotType.Children)
			) {
				targetElement.setHighlighted(true);
			}

			if (label && targetContent && targetContent.getSlotType() === Types.SlotType.Children) {
				targetContent.setHighlighted(true);
			}
		});
	}

	public render(): JSX.Element | null {
		const { store } = this.props as { store: Store.ViewStore };
		const page: Model.Page | undefined = store.getActivePage();

		if (!page) {
			return null;
		}

		const rootElement = page.getRoot();

		if (!rootElement) {
			return null;
		}

		const childrenContent = rootElement.getContentBySlotType(Types.SlotType.Children);

		const anchors = {
			[Components.ElementAnchors.content]: childrenContent ? childrenContent.getId() : '',
			[Components.ElementAnchors.element]: rootElement.getId()
		};

		const childContent = rootElement.getContentBySlotType(Types.SlotType.Children);

		return (
			<StyledDragRoot
				data-drag-root
				{...anchors}
				onBlur={e => this.handleBlur(e)}
				onChange={e => this.handleChange(e)}
				onClick={e => this.handleClick(e)}
				onContextMenu={e => this.handleContextMenu(e)}
				onDragLeave={e => this.handleDragLeave(e)}
				onDragOver={e => this.handleDragOver(e)}
				onDragStart={e => this.handleDragStart(e)}
				onDrop={e => this.handleDrop(e)}
				onKeyDown={e => this.handleKeyDown(e.nativeEvent)}
				onMouseLeave={e => this.handleMouseLeave(e)}
				onMouseOver={e => this.handleMouseOver(e)}
				innerRef={ref => (this.ref = ref)}
			>
				<Components.Element.ElementChildren>
					{childContent ? <ElementContentContainer content={childContent} /> : null}
				</Components.Element.ElementChildren>
				<ElementDragImage
					element={store.getDraggedElement()}
					innerRef={ref => (this.dragImg = ref)}
				/>
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

function elementContentFromTarget(
	target: EventTarget,
	options: { store: Store.ViewStore }
): Model.ElementContent | undefined {
	const el = above(target, `[${Components.ElementAnchors.content}]`);

	if (!el) {
		return;
	}

	const id = el.getAttribute(Components.ElementAnchors.content);

	if (typeof id !== 'string') {
		return;
	}

	return options.store.getContentById(id);
}

export function elementFromTarget(
	target: EventTarget,
	options: { sibling: boolean; store: Store.ViewStore }
): Model.Element | undefined {
	const el = above(target, `[${Components.ElementAnchors.element}]`);

	if (!el) {
		return;
	}

	const id = el.getAttribute(Components.ElementAnchors.element);

	if (typeof id !== 'string') {
		return;
	}

	const element = options.store.getElementById(id);

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
