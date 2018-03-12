import * as React from 'react';

import { colors } from '../../lsg/patterns/colors';
import Copy from '../../lsg/patterns/copy';
import { Headline } from '../../lsg/patterns/headline';
import Space, { Size } from '../../lsg/patterns/space';
import { Store } from '../../store/store';

export const PageListPreview: React.StatelessComponent = props => {
	const project = Store.getInstance().getCurrentProject();
	if (!project) {
		return <>props.children</>;
	}
	const dateString = new Intl.DateTimeFormat().format(project.getLastChangedDate());
	return (
		<Space size={[Size.XXXL, Size.XL, Size.XS, Size.XL]}>
			<Space size={[Size.S, Size.S, Size.XXXL]}>
				<Headline order={3} tagName="h1">
					{project.getName()}
				</Headline>
				<Copy textColor={colors.grey60}>
					Last change: {dateString} by {project.getLastChangedAuthor()}
				</Copy>
			</Space>
			{props.children}
		</Space>
	);
};
