import { Teaser, TeaserRow, TeaserSize, Color } from '../components';
import * as React from 'react';

export interface ConnectPaneProps {
	onClick?: React.MouseEventHandler<HTMLElement>;
}

export const ConnectPaneContainer: React.SFC<ConnectPaneProps> = props => (
	<TeaserRow>
		<Teaser
			headline="Connect a Library"
			description="Use real code components for your prototype"
			onClick={props.onClick}
			size={TeaserSize.Large}
			color={Color.Blue20}
			icon="Package"
		/>
	</TeaserRow>
);
