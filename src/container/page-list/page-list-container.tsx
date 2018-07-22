import { AddPageButton, Layout, LayoutWrap } from '../../components';
import { MessageType } from '../../message';
import * as MobxReact from 'mobx-react';
import { PageTileContainer } from './page-tile-container';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as uuid from 'uuid';

export const PageListContainer: React.StatelessComponent = MobxReact.inject('store')(
	MobxReact.observer((props): JSX.Element | null => {
		const { store } = props as { store: ViewStore };
		const project = store.getProject();
		const currentPage = store.getActivePage();
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
							focused={page === store.getProject().getFocusedItem()}
							key={page.getId()}
							page={page}
						/>
					))}
				<AddPageButton
					onClick={() =>
						props.store.getSender().send({
							id: uuid.v4(),
							payload: undefined,
							type: MessageType.CreateNewPage
						})
					}
				/>
			</Layout>
		);
	})
);
