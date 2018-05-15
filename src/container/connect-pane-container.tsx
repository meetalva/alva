import * as Components from '../components';
import * as React from 'react';

import { ViewStore } from '../store';

export const ConnectPaneContainer: React.SFC = () => {
	const store = ViewStore.getInstance();

	return (
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
					onClick={() => store.getProject().connectPatternLibrary()}
					order={Components.ButtonOrder.Primary}
				>
					Connect
				</Components.Button>
			</Components.Space>
			<Components.Link
				color={Components.colors.grey50}
				onClick={() => store.getProject().connectDefaultPatternLibrary()}
			>
				<Components.Copy size={Components.CopySize.S}>Open Alva Example</Components.Copy>
			</Components.Link>
		</div>
	);
};
