import * as React from 'react';
import DemoContainer from '../demo-container';

import { Copy, CopySize } from '../copy';
import { Icon, IconName, IconSize } from '../icons';
import { Overlay } from './index';
import { Space, SpaceSize } from '../space';

const DemoOverlay: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer>
		<Overlay isVisisble={true}>
			<Space size={[0, 0, SpaceSize.L]}>
				<Icon name={IconName.Robo} size={IconSize.S} />
			</Space>
			<Copy size={CopySize.M}>Drop the component on the left element list</Copy>
		</Overlay>
	</DemoContainer>
);

export default DemoOverlay;
