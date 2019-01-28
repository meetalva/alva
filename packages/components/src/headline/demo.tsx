import DemoContainer from '../demo-container';
import { Headline } from './index';
import * as React from 'react';

const HeadlineDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Headline">
		<Headline bold order={1} tagName="h1">
			Headline Order 1 (Bold)
		</Headline>
		<Headline order={1} tagName="h1">
			Headline Order 1
		</Headline>
		<Headline bold order={2}>
			Headline Order 2 (Bold)
		</Headline>
		<Headline order={2}>Headline Order 2</Headline>
		<Headline bold order={3}>
			Headline Order 3 (Bold)
		</Headline>
		<Headline order={3}>Headline Order 3</Headline>
	</DemoContainer>
);

export default HeadlineDemo;
