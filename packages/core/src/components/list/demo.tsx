import DemoContainer from '../demo-container';
import { List, Li, Ul } from './index';
import * as React from 'react';

const ListDemo: React.StatelessComponent = (): JSX.Element => (
	<DemoContainer title="List">
		<List headline="Default List">
			<Ul>
				<Li>Item1</Li>
				<Li>Item2</Li>
			</Ul>
		</List>
	</DemoContainer>
);

export default ListDemo;
