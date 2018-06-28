import * as React from 'react';
import * as Mobx from 'mobx';
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
	@Mobx.observable private dropTargetIndex: number;
	@Mobx.observable private draggedIndex: number;

	private draggedPage: Page;

	@Mobx.action
	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const draggedPage = utils.pageFromTarget(e.target, store);
		if (!draggedPage) {
			e.preventDefault();
			return;
		}
		this.draggedIndex = store.getProject().getPageIndex(draggedPage);
		this.draggedPage = draggedPage;
		console.log('dragged index', this.draggedIndex);
		e.dataTransfer.effectAllowed = 'copy';
	}

	@Mobx.action
	private handleDragOver(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const validDropTarget = utils.pageFromTarget(e.target, store);

		if (!validDropTarget) {
			e.preventDefault();
			return;
		}
		this.dropTargetIndex = store.getProject().getPageIndex(validDropTarget);

		if (this.draggedIndex === this.dropTargetIndex) {
			return;
		}

		e.dataTransfer.dropEffect = 'copy';
	}

	@Mobx.action
	private handleDrop(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };

		store.getProject().reArrangePagesIndex(this.dropTargetIndex, this.draggedPage);
		store.save();
	}

	public render(): JSX.Element {
		const { store } = this.props as { store: Store.ViewStore };
		const project = store.getProject();
		const currentPage = store.getCurrentPage();
		const currentPageId = currentPage ? currentPage.getId() : undefined;

		return (
			<Component.DragArea
				onDragStart={e => this.handleDragStart(e)}
				onDragLeave={e => e}
				onDragOver={e => this.handleDragOver(e)}
				onDrop={e => this.handleDrop(e)}
			>
				<Component.Layout wrap={Component.LayoutWrap.Wrap}>
					{project
						.getPages()
						.map(page => (
							<PageTileContainer
								highlighted={page.getId() === currentPageId}
								isDragging={false}
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
