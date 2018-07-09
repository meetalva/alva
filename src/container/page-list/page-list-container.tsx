import * as React from 'react';
import * as MobxReact from 'mobx-react';
import * as uuid from 'uuid';

import { ServerMessageType } from '../../message';
import { PageTileContainer } from './page-tile-container';
import { Page } from '../../model/page';
import * as Sender from '../../message/client';
import * as Component from '../../components';
import * as Store from '../../store';
import * as utils from '../../utils';

@MobxReact.inject('store')
@MobxReact.observer
export class PageListContainer extends React.Component {
	private dropTargetIndex: number;
	private draggedIndex: number;
	private draggedPage: Page;

	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const draggedPage = utils.pageFromTarget(e.target, store);
		if (!draggedPage) {
			e.preventDefault();
			return;
		}

		this.draggedPage = draggedPage;
		this.draggedIndex = store.getProject().getPageIndex(draggedPage);
		e.dataTransfer.effectAllowed = 'copy';
	}

	private handleDragLeave(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const validDropTarget = utils.pageFromTarget(e.target, store);
		if (!validDropTarget) {
			e.preventDefault();
			return;
		}

		validDropTarget.setDroppableState(false);
	}

	private handleDragOver(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const validDropTarget = utils.pageFromTarget(e.target, store);

		if (!validDropTarget) {
			e.preventDefault();
			return;
		}
		this.dropTargetIndex = store.getProject().getPageIndex(validDropTarget);

		validDropTarget.setDroppableState(true);
		e.dataTransfer.dropEffect = 'copy';
	}

	private handleDrop(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const project = store.getProject();

		project.getPages().forEach((page: Page) => page.setDroppableState(false));
		project.reArrangePagesIndex(this.dropTargetIndex, this.draggedPage);
		store.commit();
	}

	public render(): JSX.Element {
		const { store } = this.props as { store: Store.ViewStore };
		const project = store.getProject();
		const currentPage = store.getCurrentPage();
		const currentPageId = currentPage ? currentPage.getId() : undefined;

		return (
			<Component.DragArea
				onDragStart={e => this.handleDragStart(e)}
				onDragOver={e => this.handleDragOver(e)}
				onDragLeave={e => this.handleDragLeave(e)}
				onDrop={e => this.handleDrop(e)}
			>
				<Component.Layout wrap={Component.LayoutWrap.Wrap}>
					{project
						.getPages()
						.map(page => (
							<PageTileContainer
								highlighted={page.getId() === currentPageId}
								isdroppable={page.getDroppableState()}
								focused={page === store.getFocusedItem()}
								key={page.getId()}
								page={page}
							/>
						))}
					<Component.AddPageButton
						onClick={() =>
							Sender.send({
								id: uuid.v4(),
								payload: undefined,
								type: ServerMessageType.CreateNewPage
							})
						}
					/>
				</Component.Layout>
			</Component.DragArea>
		);
	}
}
