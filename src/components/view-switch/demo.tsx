import DemoContainer from '../demo-container';
import { ViewSwitch } from './index';
import * as React from 'react';

const DemoViewSwitch: React.StatelessComponent = (): JSX.Element => (
	<DemoContainer title="View Switch">
		<ViewSwitch
			onLeftClick={() => null}
			onRightClick={() => null}
			leftVisible={true}
			rightVisible={true}
		>
			Title
		</ViewSwitch>
	</DemoContainer>
);

export default DemoViewSwitch;
