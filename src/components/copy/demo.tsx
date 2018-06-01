import { Copy, CopySize } from './index';
import DemoContainer from '../demo-container';
import * as React from 'react';

const LOREM = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
In imperdiet eleifend ante. Pellentesque ut quam ac magna suscipit tincidunt nec nec magna.
Vivamus sit amet tellus quis nibh lobortis eleifend a et massa.
Vestibulum tempor erat mi, ac convallis sapien fermentum aliquet.
Nam ornare, nisi venenatis ultrices iaculis, massa nisl lobortis neque,
at fermentum tellus dui quis purus.
Vestibulum tincidunt dui turpis, sed iaculis dolor venenatis sit amet.
`;

const CopyDemo: React.StatelessComponent = (): JSX.Element => (
	<DemoContainer title="Copy">
		<Copy size={CopySize.S}>{LOREM}</Copy>
		<Copy size={CopySize.M}>{LOREM}</Copy>
	</DemoContainer>
);

export default CopyDemo;
