import DemoContainer from '../demo-container';
import { Headline } from './index';
import * as React from 'react';

const HeadlineDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Headline">
		<Headline type="primary" order={1} tagName="h1">
			Headline Order 1
		</Headline>
		<Headline type="primary" order={2}>
			Headline Order 2
		</Headline>
		<Headline type="primary" order={3}>
			Headline Order 3
		</Headline>
	</DemoContainer>
);

export default HeadlineDemo;
