import * as React from 'react';
import * as MobxReact from 'mobx-react';
import * as uuid from 'uuid';

import { ServerMessageType } from '../../message';
import { PageTileContainer } from './page-tile-container';
import * as Sender from '../../message/client';
import * as Component from '../../components';
import * as Store from '../../store';
import * as utils from '../../utils';

@MobxReact.inject('store')
@MobxReact.observer
export class PageListContainer extends React.Component {
	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		const { store } = this.props as { store: Store.ViewStore };
		const draggedPage = utils.pageFromTarget(e.target, store);
		console.log(draggedPage, '********');

		// if (!draggedPage) {
		// 	e.preventDefault();
		// 	return;
		// }
		// draggedPage.setIsDragging(true);
		e.dataTransfer.effectAllowed = 'copy';
	}

	private handleDragOver(e: React.DragEvent<HTMLElement>): void {
		// const { store } = this.props as { store: Store.ViewStore };
		// const target = e.target as HTMLElement;
	}
	public render(): JSX.Element {
		const { store } = this.props as { store: Store.ViewStore };
		const project = store.getProject();
		const currentPage = store.getCurrentPage();
		const currentPageId = currentPage ? currentPage.getId() : undefined;

		return (
			<Component.DragArea
				onDragStart={e => this.handleDragStart(e)}
				onDragLeave={e => console.log('')}
				onDragOver={e => this.handleDragOver(e)}
				onDrop={e => console.log('')}
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
