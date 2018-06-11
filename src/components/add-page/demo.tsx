import DemoContainer from '../demo-container';
import * as React from 'react';
import { AddPage } from '.';

const AddPageDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Floating Button">
		<AddPage />
	</DemoContainer>
);

export default AddPageDemo;
