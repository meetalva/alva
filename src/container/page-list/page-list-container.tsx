import * as Sender from '../../message/client';
import { AddPageButton, Layout, LayoutWrap } from '../../components';
import { ServerMessageType } from '../../message';
import * as MobxReact from 'mobx-react';
import { PageTileContainer } from './page-tile-container';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as uuid from 'uuid';

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
			<Layout wrap={LayoutWrap.Wrap}>
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
				<AddPageButton
					onClick={() =>
						Sender.send({
							id: uuid.v4(),
							payload: undefined,
							type: ServerMessageType.CreateNewPage
						})
					}
				/>
			</Layout>
		);
	})
);
