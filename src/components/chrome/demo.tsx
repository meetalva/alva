import { CopySize } from '../copy';
import DemoContainer from '../demo-container';
import { IconRegistry } from '../icons';
import { Chrome } from './index';
import * as React from 'react';
import { ViewSwitch, ViewTitle } from '../view-switch';

const DemoChrome: React.StatelessComponent<void> = () => (
	<DemoContainer title="Chrome">
		<Chrome>
			<ViewSwitch
				fontSize={CopySize.M}
				onLeftClick={() => null}
				onRightClick={() => null}
				leftVisible={true}
				rightVisible={true}
			>
				<ViewTitle justify="center" title="Page name" />
			</ViewSwitch>
			<ViewSwitch
				fontSize={CopySize.M}
				onLeftClick={() => null}
				onRightClick={() => null}
				leftVisible={true}
				rightVisible={true}
			>
				<ViewTitle justify="center" title="Page name" />
			</ViewSwitch>
		</Chrome>
		<IconRegistry />
	</DemoContainer>
);

export default DemoChrome;
