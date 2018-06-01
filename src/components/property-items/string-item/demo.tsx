import { StringItem } from './index';
import * as React from 'react';
import DemoContainer from '../../demo-container';

const NOOP = () => {}; // tslint:disable-line no-empty

const StringItemDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="String Item">
		<StringItem onChange={NOOP} label="Text" />
		<StringItem
			onChange={NOOP}
			label="Text"
			value="this is a very long example text to test text overflow and stuff"
			description="Lorem ipsum doloret"
		/>
	</DemoContainer>
);

export default StringItemDemo;
