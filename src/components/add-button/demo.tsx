import DemoContainer from '../demo-container';
import * as React from 'react';
import { AddButton } from '.';

const AddButtonDemo: React.StatelessComponent = (): JSX.Element => (
	<DemoContainer title="Add Page Button">
		<AddButton text="Add Page" />
	</DemoContainer>
);

export default AddButtonDemo;
