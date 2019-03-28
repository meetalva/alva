import * as C from '@meetalva/components';
import { ElementDragImage } from '../element-drag-image';
import { ElementContentContainer } from './element-content-container';
import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import * as Model from '@meetalva/model';
import * as React from 'react';

import * as Store from '../../store';
import * as Types from '@meetalva/types';
import * as utils from '@meetalva/util';

@MobxReact.inject('store')
@MobxReact.observer
export class ElementList extends React.Component {
	private dragImg: React.RefObject<any> = React.createRef();
	private globalDragEndListener?: (e: DragEvent) => void;
	private globalDropListener?: (e: DragEvent) => void;

	public componentDidMount(): void {
		const { store } = this.props as { store: Store.ViewStore };
		this.globalDragEndListener = e => store.unsetDraggedElement();
		this.globalDropListener = this.globalDragEndListener;
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
	}

	@Mobx.action
	private handleClick(e: React.MouseEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const target = e.target as HTMLElement;
		const icon = utils.above(target, `div[${C.ElementAnchors.icon}]`);

		// Skip and deselect elements if the root itself is clicked
		if (target.getAttribute('data-drag-root')) {
			store.getProject().unsetSelectedElement();
			return;
		}

		const element = utils.elementFromTarget(e.target, { sibling: false, store });
		const targetContent = utils.elementContentFromTarget(e.target, { store });
		const label = utils.above(e.target, `[${C.ElementAnchors.label}]`);

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

		if (store.getSelectedElement() !== element) {
			store.setSelectedElement(element);
		}
	}

	@Mobx.action
	private handleContextMenu(e: React.MouseEvent<HTMLElement>): void {
		e.preventDefault();

		const { store } = this.props as { store: Store.ViewStore };
		const element = utils.elementFromTarget(e.target, { sibling: false, store });

		if (element) {
			store.requestContextMenu({
				menu: Types.ContextMenuType.ElementMenu,
				projectId: store.getProject().getId(),
				data: { element: element.toJSON() },
				position: {
					x: e.clientX,
					y: e.clientY
				}
			});
		}
	}

	@Mobx.action
	private handleDragLeave(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const target = e.target as HTMLElement;
		const position = getPlaceholderPosition(target.getAttribute(C.ElementAnchors.placeholder));

		const targetElement = utils.elementFromTarget(e.target, { sibling: false, store });
		const targetContent = utils.elementContentFromTarget(e.target, { store });

		if (!targetElement) {
			return;
		}

		if (position !== C.PlaceholderPosition.None) {
			targetElement.setPlaceholderHighlighted(C.PlaceholderPosition.None);
		} else {
			targetElement.setHighlighted(false);

			if (targetContent) {
				targetContent.setHighlighted(false);
			}
		}
	}

	@Mobx.action
	private handleDragEnter(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };

		const target = e.target as HTMLElement;
		const position = getPlaceholderPosition(target.getAttribute(C.ElementAnchors.placeholder));

		const visualTargetElement = utils.elementFromTarget(e.target, { sibling: false, store });

		const targetContent =
			position !== C.PlaceholderPosition.None
				? visualTargetElement && visualTargetElement.getContainer()
				: utils.elementContentFromTarget(e.target, { store });

		const draggedElement = store.getDraggedElement();

		if (!targetContent || !visualTargetElement || !draggedElement) {
			return;
		}

		const accepted = targetContent.accepts(draggedElement);

		if (!accepted) {
			return;
		}

		targetContent.setHighlighted(position === C.PlaceholderPosition.None);
		visualTargetElement.setHighlighted(position === C.PlaceholderPosition.None);
		visualTargetElement.setPlaceholderHighlighted(position);
	}

	@Mobx.action
	private handleDragOver(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };

		const target = e.target as HTMLElement;
		const position = getPlaceholderPosition(target.getAttribute(C.ElementAnchors.placeholder));
		const visualTargetElement = utils.elementFromTarget(e.target, { sibling: false, store });

		const targetContent =
			position !== C.PlaceholderPosition.None
				? visualTargetElement && visualTargetElement.getContainer()
				: utils.elementContentFromTarget(e.target, { store });

		const draggedElement = store.getDraggedElement();

		if (!targetContent || !visualTargetElement || !draggedElement) {
			return;
		}

		const accepted = targetContent.accepts(draggedElement);

		if (!accepted) {
			return;
		}

		const dropEffect = draggedElement.getParent() ? 'move' : 'copy';
		e.dataTransfer.dropEffect = dropEffect;
	}

	@Mobx.action
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

		if (this.dragImg.current) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text', JSON.stringify(draggedElement.toJSON()));
			e.dataTransfer.setDragImage(this.dragImg.current, 75, 15);
		}

		Mobx.transaction(() => {
			draggedElement.setDragged(true);
			store.setSelectedElement(draggedElement);
		});
	}

	@Mobx.action
	private handleDrop(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const target = e.target as HTMLElement;

		const position = getPlaceholderPosition(target.getAttribute(C.ElementAnchors.placeholder));
		const draggedElement = store.getDraggedElement();
		const visualTargetElement = utils.elementFromTarget(e.target, { sibling: false, store });

		if (!draggedElement || !visualTargetElement) {
			return;
		}

		const targetContent =
			position !== C.PlaceholderPosition.None
				? visualTargetElement.getContainer()
				: utils.elementContentFromTarget(e.target, { store });

		if (!targetContent) {
			return;
		}

		const getDropIndex = () => {
			if (position === C.PlaceholderPosition.None) {
				return targetContent.getElements().length;
			}

			return utils.calculateDropIndex({
				target: visualTargetElement,
				dragged: draggedElement
			});
		};

		const index = getDropIndex();
		const offset = position === C.PlaceholderPosition.After ? 1 : 0;

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
			index: index + offset
		});
	}

	@Mobx.action
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

	@Mobx.action
	private handleMouseOver(e: React.MouseEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const targetElement = utils.elementFromTarget(e.target as HTMLElement, {
			sibling: false,
			store
		});

		const targetContent = utils.elementContentFromTarget(e.target, { store });
		const item = utils.above(e.target, `[${C.ElementAnchors.item}]`);

		const isElementMouseOver = item && targetElement;
		const isContentMouseOver = item && targetContent;
		const isRootMouseOver =
			!item && targetElement && targetElement.getRole() === Types.ElementRole.Root;

		Mobx.transaction(() => {
			if (isElementMouseOver || isContentMouseOver || isRootMouseOver) {
				store.getProject().unsetHighlightedElement();
				store.getProject().unsetHighlightedElementContent();
			}

			if (
				item &&
				targetElement &&
				targetContent === targetElement.getContentBySlotId(Types.SlotType.Children)
			) {
				targetElement.setHighlighted(true);
			}

			if (item && targetContent && targetContent.getSlotType() === Types.SlotType.Children) {
				targetContent.setHighlighted(true);
			}
		});
	}

	private getDragAnchors(): C.DragAreaAnchorProps {
		const { store } = this.props as { store: Store.ViewStore };
		const page: Model.Page | undefined = store.getActivePage();
		const rootElement = page && page.getRoot();

		const childrenContent =
			rootElement && rootElement.getContentBySlotType(Types.SlotType.Children);
		const childrenId = childrenContent ? childrenContent.getId() : 'no-child-element';
		const rootElId = rootElement ? rootElement.getId() : 'no-root-element';

		return {
			[C.DragAreaAnchors.content]: childrenId,
			[C.DragAreaAnchors.element]: rootElId
		};
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
		const childContent = rootElement.getContentBySlotType(Types.SlotType.Children);
		const hasChildren = childContent && childContent.getElements().length > 0;

		return (
			<C.DragArea
				anchors={this.getDragAnchors()}
				onClick={e => this.handleClick(e)}
				onContextMenu={e => this.handleContextMenu(e)}
				onDragEnter={e => this.handleDragEnter(e)}
				onDragLeave={e => this.handleDragLeave(e)}
				onDragOver={e => this.handleDragOver(e)}
				onDragStart={e => this.handleDragStart(e)}
				onDrop={e => this.handleDrop(e)}
				onMouseLeave={e => this.handleMouseLeave(e)}
				onMouseOver={e => this.handleMouseOver(e)}
			>
				<C.Element.ElementChildren>
					{childContent ? <ElementContentContainer content={childContent} /> : null}
					{!hasChildren && (
						<C.EmptyState
							headline="Elements"
							copy="Drop components here from the library below"
							image={C.Images.EmptyElements}
						/>
					)}
				</C.Element.ElementChildren>
				<ElementDragImage element={store.getDraggedElement()} dragRef={this.dragImg} />
			</C.DragArea>
		);
	}
}

function getPlaceholderPosition(value: string | null): C.PlaceholderPosition {
	switch (value) {
		case 'before':
			return C.PlaceholderPosition.Before;
		case 'after':
			return C.PlaceholderPosition.After;
		case 'none':
		default:
			return C.PlaceholderPosition.None;
	}
}
