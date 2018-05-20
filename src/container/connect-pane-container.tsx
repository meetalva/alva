import { ConnectLibrary } from '../components/connect-library';
import * as React from 'react';

export interface ConnectPaneProps {
	onPrimaryButtonClick?: React.MouseEventHandler<HTMLElement>;
	onSecondaryButtonClick?: React.MouseEventHandler<HTMLElement>;
}

export const ConnectPaneContainer: React.SFC<ConnectPaneProps> = props => (
	<ConnectLibrary
		headline={'Connect to a Library'}
		description={
			'To build prototypes with already existing components, connect to your React component	library first.'
		}
		primaryButton={'Connect'}
		secondaryButton={'Download Alva Example'}
		onPrimaryButtonClick={props.onPrimaryButtonClick}
		onSecondaryButtonClick={props.onSecondaryButtonClick}
	/>
);
