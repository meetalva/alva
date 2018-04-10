import { CopySize } from '../copy';
import { IconName, IconRegistry } from '../icons';
import Chrome from './index';
import * as React from 'react';
import { ViewSwitch } from '../view-switch';

const DemoChrome: React.StatelessComponent<void> = () => (
	<div>
		<Chrome>
			<ViewSwitch
				onLeftClick={() => null}
				onRightClick={() => null}
				leftVisible={true}
				rightVisible={true}
				title="Page Title"
			/>
			<ViewSwitch
				fontSize={CopySize.M}
				onLeftClick={() => null}
				onRightClick={() => null}
				leftVisible={true}
				rightVisible={true}
				title="Page Title"
			/>
		</Chrome>
		<IconRegistry names={IconName} />
	</div>
);

export default DemoChrome;
