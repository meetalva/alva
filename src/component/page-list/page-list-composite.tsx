import Layout from '../../lsg/patterns/layout';
import { observer } from 'mobx-react';
import { PageRef } from '../../store/page/page-ref';
import { PageTileContainer } from './page-tile-container';
import * as React from 'react';

export interface PageListProps {
	focusStates: boolean[];
	pages: PageRef[];
	onClick(event: React.MouseEvent<HTMLElement>, index: number): void;
}

export const PageListComposite: React.StatelessComponent<PageListProps> = observer(
	(props): JSX.Element => (
		<Layout>
			{props.pages.map((page: PageRef, i: number) => (
				<PageTileContainer
					focused={props.focusStates[i]}
					key={page.getId()}
					onClick={e => props.onClick(e, i)}
					page={page}
				/>
			))}
		</Layout>
	)
);
