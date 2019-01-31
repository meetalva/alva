import * as React from 'react';
import * as MobxReact from 'mobx-react';
import { PageTileContainer } from './page-tile-container';
import * as Components from '@meetalva/components';
import * as Model from '@meetalva/model';
import * as Store from '../../store';
import * as Types from '@meetalva/types';
import * as utils from '@meetalva/util';

@MobxReact.inject('store')
@MobxReact.observer
export class PageListContainer extends React.Component {
	private draggedPage?: Model.Page;

	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const draggedPage = utils.pageFromTarget(e.target, store);
		if (!draggedPage) {
			e.preventDefault();
			return;
		}

		this.draggedPage = draggedPage;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text', JSON.stringify(draggedPage.toJSON()));
	}

	private handleDragLeave(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const validDropTarget = utils.pageFromTarget(e.target, store);

		if (!validDropTarget) {
			e.preventDefault();
			return;
		}

		validDropTarget.setDroppableBackState(false);
		validDropTarget.setDroppableNextState(false);
	}

	private handleDragOver(e: React.DragEvent<HTMLElement>): void {
		e.preventDefault();

		const { store } = this.props as { store: Store.ViewStore };
		const dropTarget = utils.pageFromTarget(e.target, store);

		if (!dropTarget || !this.draggedPage) {
			return;
		}

		if (this.draggedPage.getIndex() > dropTarget.getIndex()) {
			dropTarget.setDroppableBackState(true);
			e.dataTransfer.dropEffect = 'move';
		} else if (this.draggedPage.getIndex() < dropTarget.getIndex()) {
			dropTarget.setDroppableNextState(true);
			e.dataTransfer.dropEffect = 'move';
		}
	}

	private handleDrop(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const project = store.getProject();
		const dropTarget = utils.pageFromTarget(e.target, store);

		if (!dropTarget || !this.draggedPage) {
			this.draggedPage = undefined;
			e.preventDefault();
			return;
		}

		if (dropTarget.getPageDropState().next) {
			project.movePageAfter({ page: this.draggedPage, targetPage: dropTarget });
			dropTarget.setDroppableNextState(false);
		} else if (dropTarget.getPageDropState().back) {
			project.movePageBefore({ page: this.draggedPage, targetPage: dropTarget });
			dropTarget.setDroppableBackState(false);
		}

		store.commit();
	}

	private getDragAreaAnchors(): Components.DragAreaAnchorProps {
		const { store } = this.props as { store: Store.ViewStore };
		const currentPage: Model.Page | undefined = store.getActivePage();

		const rootEl = currentPage && currentPage.getRoot();

		const childrenContent = rootEl && rootEl.getContentBySlotType(Types.SlotType.Children);
		const contentId = childrenContent ? childrenContent.getId() : '';
		const rootElId = rootEl ? rootEl.getId() : 'no-root-element';

		return {
			[Components.DragAreaAnchors.content]: contentId,
			[Components.DragAreaAnchors.element]: rootElId
		};
	}

	public render(): JSX.Element | null {
		const { store } = this.props as { store: Store.ViewStore };
		const project: Model.Project = store.getProject();
		const currentPage: Model.Page | undefined = store.getActivePage();
		const currentPageId = currentPage ? currentPage.getId() : '';
		return (
			<Components.DragArea
				anchors={this.getDragAreaAnchors()}
				onDragStart={e => this.handleDragStart(e)}
				onDragEnter={e => e}
				onDragOver={e => this.handleDragOver(e)}
				onDragLeave={e => this.handleDragLeave(e)}
				onDrop={e => this.handleDrop(e)}
			>
				<Components.Layout inset={Components.SpaceSize.XS} wrap={Components.LayoutWrap.Wrap}>
					{project
						.getPages()
						.map(page => (
							<PageTileContainer
								highlighted={page.getId() === currentPageId}
								isDroppable={page.getPageDropState()}
								focused={page === store.getProject().getFocusedItem()}
								key={page.getId()}
								page={page}
							/>
						))}
					<Components.AddButton margin={true} onClick={() => store.executePageAddNew()}>
						Add Page
					</Components.AddButton>
				</Components.Layout>
			</Components.DragArea>
		);
	}
}
