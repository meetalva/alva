import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import styled from 'styled-components';

import { ElementDragImage } from '../element-drag-image';
import { elementMenu } from '../../electron/context-menus';
import { ElementContainer } from './element-container';
import * as Components from '../../components';
import * as Store from '../../store';
import * as Types from '../../types';
import * as utils from '../../utils';

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
		const changedElement = utils.elementFromTarget(e.target, { sibling: false, store });

		if (changedElement) {
			changedElement.setName(target.value);
		}
	}

	private handleClick(e: React.MouseEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const target = e.target as HTMLElement;
		const icon = utils.above(target, `svg[${Components.ElementAnchors.icon}]`);

		// Skip and deselect elements if the root itself is clicked
		if (target.getAttribute('data-drag-root')) {
			store.unsetSelectedElement();
			return;
		}

		const element = utils.elementFromTarget(e.target, { sibling: false, store });
		const targetContent = utils.elementContentFromTarget(e.target, { store });
		const label = utils.above(e.target, `[${Components.ElementAnchors.label}]`);

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
		const element = utils.elementFromTarget(e.target, { sibling: false, store });
		if (element) {
			elementMenu(element, store);
		}
	}

	private handleDragLeave(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const targetElement = utils.elementFromTarget(e.target, { sibling: false, store });

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
		const visualTargetElement = utils.elementFromTarget(e.target, { sibling: false, store });

		const targetContent = isSibling
			? visualTargetElement && visualTargetElement.getContainer()
			: utils.elementContentFromTarget(e.target, { store });

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
		const draggedElement = utils.elementFromTarget(e.target, { sibling: false, store });

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
		const visualTargetElement = utils.elementFromTarget(e.target, { sibling: false, store });

		if (!draggedElement || !visualTargetElement) {
			return;
		}

		const targetContent = isSiblingDrop
			? visualTargetElement.getContainer()
			: utils.elementContentFromTarget(e.target, { store });

		if (!targetContent) {
			return;
		}

		const getDropIndex = () => {
			if (!isSiblingDrop) {
				return targetContent.getElements().length;
			}
			return utils.calculateDropIndex({
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

		store.setSelectedElement(draggedElement);
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
		const element = utils.elementFromTarget(e.target as HTMLElement, { sibling: false, store });
		const targetContent = utils.elementContentFromTarget(e.target, { store });

		if (targetContent) {
			targetContent.setHighlighted(false);
		}

		if (element) {
			element.setHighlighted(false);
		}
	}

	private handleMouseOver(e: React.MouseEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const targetElement = utils.elementFromTarget(e.target as HTMLElement, {
			sibling: false,
			store
		});
		const targetContent = utils.elementContentFromTarget(e.target, { store });
		const label = utils.above(e.target, `[${Components.ElementAnchors.label}]`);

		Mobx.transaction(() => {
			if (
				(label && targetElement) ||
				(label && targetContent) ||
				(!label && targetElement && targetElement.getRole() === Types.ElementRole.Root)
			) {
				store
					.getProject()
					.getElementContents()
					.filter(sec => sec.getHighlighted())
					.forEach(se => se.setHighlighted(false));

				store
					.getProject()
					.getElements()
					.filter(se => se.getHighlighted())
					.forEach(se => se.setHighlighted(false));
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
		const page: Model.Page | undefined = store.getCurrentPage();

		if (!page) {
			return null;
		}

		const rootElement = page.getRoot();

		if (!rootElement) {
			return null;
		}

		const anchors = {
			[Components.ElementAnchors.content]: (rootElement.getContentBySlotType(
				Types.SlotType.Children
			) as Model.ElementContent).getId(),
			[Components.ElementAnchors.element]: rootElement.getId()
		};

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
				<ElementContainer element={rootElement} />
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
