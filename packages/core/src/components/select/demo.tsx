import * as React from 'react';
import { Select } from '.';

const options = [
	{
		label: 'A',
		value: '1'
	},
	{
		label: 'B',
		value: '2'
	}
];

const SelectDemo: React.SFC = props => (
	<div>
		<Select options={options} value={options[0]} />
		<Select options={options} value={options[1]} menuIsOpen />
	</div>
);

export default SelectDemo;
