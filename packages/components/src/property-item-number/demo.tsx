import { PropertyItemNumber } from './property-item-number';
import * as React from 'react';
import DemoContainer from '../demo-container';

const NOOP = () => {}; // tslint:disable-line no-empty

const StringItemDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="String Item">
		<PropertyItemNumber onChange={NOOP} label="Text" />
		<PropertyItemNumber
			onChange={NOOP}
			label="Text"
			value={0}
			description="Lorem ipsum doloret"
		/>
	</DemoContainer>
);

export default StringItemDemo;
