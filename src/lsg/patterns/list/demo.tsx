import DemoContainer from '../demo-container';
import { IconName, IconRegistry } from '../icons';
import List, {ListItemProps} from './index';
import PatternListItem from '../pattern-list-item';
import * as React from 'react';

const ListItems: ListItemProps[] = [
	{
		active: true,
		value: 'A'
	},
	{
		value: 'B'
	}
];

const ListDemo: React.StatelessComponent<{}> = (): JSX.Element => (
	<DemoContainer title="List Demo">
		<List items={ListItems} headline="Default List" />
		<List headline="Pattern List">
			<PatternListItem>Item1</PatternListItem>
		</List>
		<IconRegistry names={IconName}/>
	</DemoContainer>
);

export default ListDemo;
