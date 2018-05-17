import * as Components from '../components';
import * as React from 'react';

export interface ConnectPaneProps {
	onPrimaryButtonClick?: React.MouseEventHandler<HTMLElement>;
	onSecondaryButtonClick?: React.MouseEventHandler<HTMLElement>;
}

export const ConnectPaneContainer: React.SFC<ConnectPaneProps> = props => (
	<div>
		<Components.Space sizeBottom={Components.SpaceSize.L}>
			<Components.Headline textColor={Components.colors.grey20} order={2}>
				Connect to a Library
			</Components.Headline>
		</Components.Space>
		<Components.Space sizeBottom={Components.SpaceSize.XXXL}>
			<Components.Copy size={Components.CopySize.M} textColor={Components.colors.grey20}>
				To build prototypes with already existing components, connect to your React component
				library first.
			</Components.Copy>
		</Components.Space>
		<Components.Space sizeBottom={Components.SpaceSize.S}>
			<Components.Button
				onClick={props.onPrimaryButtonClick}
				order={Components.ButtonOrder.Primary}
			>
				Connect
			</Components.Button>
		</Components.Space>
		<Components.Link color={Components.colors.grey50} onClick={props.onSecondaryButtonClick}>
			<Components.Copy size={Components.CopySize.S}>Open Alva Example</Components.Copy>
		</Components.Link>
	</div>
);
