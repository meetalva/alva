import DemoContainer from '../demo-container';
import { IconName, IconRegistry } from '../icons';
import List, {Li, Ul} from './index';
import PatternListItem from '../pattern-list-item';
import * as React from 'react';

const ListDemo: React.StatelessComponent<{}> = (): JSX.Element => (
	<DemoContainer title="List Demo">
		<List headline="Default List">
			<Ul>
				<Li>
					Item1
				</Li>
				<Li>
					Item2
				</Li>
			</Ul>
		</List>
		<List headline="Pattern List">
			<Ul>
				<PatternListItem>Item1</PatternListItem>
			</Ul>
		</List>
		<IconRegistry names={IconName}/>
	</DemoContainer>
);

export default ListDemo;
