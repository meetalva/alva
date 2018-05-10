import { IconName, IconRegistry } from '../icons';
import { ViewSwitch } from './index';
import * as React from 'react';

const DemoViewSwitch: React.StatelessComponent = (): JSX.Element => (
	<div>
		<ViewSwitch
			onLeftClick={() => null}
			onRightClick={() => null}
			leftVisible={true}
			rightVisible={true}
			title="Page Name"
		/>
		<IconRegistry names={IconName} />
	</div>
);

export default DemoViewSwitch;
