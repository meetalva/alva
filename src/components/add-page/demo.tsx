import DemoContainer from '../demo-container';
import * as React from 'react';
import { AddPage } from '.';

const AddPageDemo: React.StatelessComponent = (): JSX.Element => (
	<DemoContainer title="Add Page">
		<AddPage />
	</DemoContainer>
);

export default AddPageDemo;
