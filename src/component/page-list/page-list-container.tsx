import Layout, { LayoutWrap } from '../../lsg/patterns/layout';
import { observer } from 'mobx-react';
import { PageAddButton } from './page-add-button';
import { PageTileContainer } from './page-tile-container';
import * as React from 'react';
import Space, { SpaceSize } from '../../lsg/patterns/space';
import { ViewStore } from '../../store';

export const PageListContainer: React.StatelessComponent = observer((): JSX.Element | null => {
	const store = ViewStore.getInstance();
	const project = store.getCurrentProject();
	const currentPage = store.getCurrentPage();
	const currentPageId = currentPage ? currentPage.getId() : undefined;

	if (!project) {
		return null;
	}

	return (
		<Space sizeBottom={SpaceSize.XXXL * 3}>
			<Layout wrap={LayoutWrap.Wrap}>
				{project
					.getPages()
					.map((page, i) => (
						<PageTileContainer
							focused={page.getId() === currentPageId}
							key={page.getId()}
							page={page}
						/>
					))}
				<PageAddButton />
			</Layout>
		</Space>
	);
});