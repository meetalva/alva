import { PropertyItem } from '../property-item';
import * as React from 'react';
import { Select, SimpleSelectOption } from '../select';

export interface PropertyItemSelectValues {
	id: string;
	name: string;
}

export interface PropertyItemSelectProps {
	className?: string;
	description?: string;
	label: string;
	required?: boolean;
	selectedValue: string | undefined;
	values: PropertyItemSelectValues[];
	onChange?(item: SimpleSelectOption): void;
	onFocus?(): void;
}

export const PropertyItemSelect: React.StatelessComponent<PropertyItemSelectProps> = props => {
	const selected = props.values.find(v => v.id === props.selectedValue);
	const value = selected ? { label: selected.name, value: selected.id } : undefined;

	return (
		<PropertyItem description={props.description} label={props.label}>
			<Select
				onChange={props.onChange}
				onFocus={props.onFocus}
				options={props.values.map(v => ({ label: v.name, value: v.id }))}
				value={value}
			/>
		</PropertyItem>
	);
};
