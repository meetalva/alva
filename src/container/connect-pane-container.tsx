import { Teaser } from '../components';
import * as React from 'react';

export interface ConnectPaneProps {
	onPrimaryButtonClick?: React.MouseEventHandler<HTMLElement>;
	onSecondaryButtonClick?: React.MouseEventHandler<HTMLElement>;
}

export const ConnectPaneContainer: React.SFC<ConnectPaneProps> = props => (
	<Teaser
		headline="Connect to a Library"
		description={`
			To build prototypes with already existing components,
			connect to your React & Typescript component library first.
		`}
		primaryButton="Connect"
		secondaryButton="Download Example File with Library "
		onPrimaryButtonClick={props.onPrimaryButtonClick}
		onSecondaryButtonClick={props.onSecondaryButtonClick}
	/>
);
