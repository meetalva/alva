import DemoContainer from '../demo-container';
import { ViewSwitch, ViewTitle } from './index';
import * as React from 'react';

const DemoViewSwitch: React.StatelessComponent = (): JSX.Element => (
	<DemoContainer title="View Switch">
		<ViewSwitch
			onLeftClick={() => null}
			onRightClick={() => null}
			leftVisible={true}
			rightVisible={true}
		>
			<ViewTitle justify="center" title="Page name" />
		</ViewSwitch>
	</DemoContainer>
);

export default DemoViewSwitch;
