import * as React from 'react';

import { colors } from '../../lsg/patterns/colors';
import Copy from '../../lsg/patterns/copy';
import { Headline } from '../../lsg/patterns/headline';
import Space, { Size } from '../../lsg/patterns/space';

export interface PageListPreviewProps {
	headline: string;
	lastChangedDate: string;
}

export const PageListPreview: React.StatelessComponent<PageListPreviewProps> = props => (
	<Space size={[Size.XXXL, Size.XL, Size.XS, Size.XL]}>
		<Space size={[Size.S, Size.S, Size.XXXL]}>
			<Headline order={3} tagName="h1">
				{props.headline}
			</Headline>
			<Copy textColor={colors.grey60}>Last change: {props.lastChangedDate}</Copy>
		</Space>
		{props.children}
	</Space>
);
