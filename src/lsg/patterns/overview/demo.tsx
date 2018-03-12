import * as React from 'react';

import DemoContainer from '../demo-container';
import Overview from './index';

const OverviewDemo: React.StatelessComponent<{}> = (): JSX.Element => (
	<DemoContainer title="Overview">
		<Overview />
	</DemoContainer>
);

export default OverviewDemo;
