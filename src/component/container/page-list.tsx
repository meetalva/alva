import * as React from 'react';

import Layout from '../../lsg/patterns/layout';
import PreviewTile from '../../lsg/patterns/preview-tile';
import Space, { Size } from '../../lsg/patterns/space';

import { PageRef } from '../../store/project/page-ref';

export interface PageListProps {
	pages: PageRef[];
}

const PageList: React.StatelessComponent<PageListProps> = (props): JSX.Element => {
	console.log(props.pages, 'this are the pages');
	return (
		<Layout>
			{props.pages.map((page: PageRef, i: number) => {
				return (
					<Space key={i} size={Size.S}>
						<PreviewTile name={page.getName()} />
					</Space>
				);
			})}
		</Layout>
	);
};

export default PageList;
