import List, {ListItemProps} from './index';
import * as React from 'react';

const ListItems: ListItemProps[] = [
	{
		active: true,
		value: 'A'
	},
	{value: 'B'}
];

const ListDemo: React.StatelessComponent<{}> = (): JSX.Element => (
	<List items={ListItems} headline="List Demo" />
);

export default ListDemo;
