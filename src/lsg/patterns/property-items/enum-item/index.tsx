import * as React from 'react';

export interface EnumItemProps {
	selectedValue: string;
	values: string[];
	className?: string;
	handleChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

export const EnumItem: React.StatelessComponent<EnumItemProps> = props => {
	const { className, values, selectedValue, handleChange } = props;

	return (
		<select className={className} onChange={handleChange} value={selectedValue}>
			{values.map(value =>
				<option value={value} key={value}>{value}</option>
			)};
		</select>
	);
};

export default EnumItem;
