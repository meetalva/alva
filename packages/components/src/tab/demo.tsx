import * as React from 'react';
import DemoContainer from '../demo-container';
import { Tab } from './';

export default (): JSX.Element => (
	<DemoContainer title="Tab">
		<Tab>Demo</Tab>
		<Tab active>Demo</Tab>
	</DemoContainer>
);
