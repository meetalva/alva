import { Teaser, TeaserRow, TeaserSize, Color } from '../components';
import * as React from 'react';

export interface ConnectPaneProps {
	onClick?: React.MouseEventHandler<HTMLElement>;
}

export const ConnectPaneContainer: React.SFC<ConnectPaneProps> = props => (
	<TeaserRow>
		<Teaser
			headline="Connect a Library"
			description={`
				Use real Code Components for your Prototype
			`}
			onClick={props.onClick}
			size={TeaserSize.Large}
			color={Color.Blue20}
			icon="Package"
		/>
	</TeaserRow>
);
