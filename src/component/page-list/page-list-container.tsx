import Layout from '../../lsg/patterns/layout';
import { observer } from 'mobx-react';
import { PageRef } from '../../store/page/page-ref';
import { PageTileContainer } from './page-tile-container';
import * as React from 'react';
import { Store } from '../../store/store';

export const PageListContainer: React.StatelessComponent = observer((): JSX.Element | null => {
	const store = Store.getInstance();
	const project = store.getCurrentProject();
	const currentPage = store.getCurrentPageRef();
	const currentPageId = currentPage ? currentPage.getId() : undefined;

	if (!project) {
		return null;
	}

	return (
		<Layout>
			{project
				.getPages()
				.map((pageRef: PageRef, i: number) => (
					<PageTileContainer
						focused={pageRef.getId() === currentPageId}
						key={pageRef.getId()}
						page={pageRef}
					/>
				))}
		</Layout>
	);
});
