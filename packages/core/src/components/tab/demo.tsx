import * as React from 'react';
import DemoContainer from '../demo-container';
import { Tab } from './';

const handleChange = (e: React.ChangeEvent<HTMLInputElement>): string => e.target.value;

export default (): JSX.Element => (
	<DemoContainer title="Tab">
		<Tab title="Design" active />
		<Tab title="Library" active />
	</DemoContainer>
);
