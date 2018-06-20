import * as React from 'react';
import * as MobxReact from 'mobx-react';
import * as uuid from 'uuid';

import * as Sender from '../../message/client';
import * as Component from '../../components';
import { ServerMessageType } from '../../message';
import { PageTileContainer } from './page-tile-container';
import { ViewStore } from '../../store';

export const PageListContainer: React.StatelessComponent = MobxReact.inject('store')(
	MobxReact.observer((props): JSX.Element | null => {
		const { store } = props as { store: ViewStore };
		const project = store.getProject();
		const currentPage = store.getCurrentPage();
		const currentPageId = currentPage ? currentPage.getId() : undefined;

		if (!project) {
			return null;
		}

		return (
			<Component.DragArea onDragStart={e => console.log(e.target)}>
				<Component.Layout wrap={Component.LayoutWrap.Wrap}>
					{project
						.getPages()
						.map(page => (
							<PageTileContainer
								highlighted={page.getId() === currentPageId}
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
	})
);
