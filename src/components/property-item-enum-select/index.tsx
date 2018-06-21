import { PropertyItem } from '../property-item';
import * as React from 'react';
import { Select, SelectOption } from '../select';

export interface PropertyItemEnumSelectValues {
	id: string;
	name: string;
}

export interface PropertyItemEnumSelectProps {
	className?: string;
	description?: string;
	label: string;
	onChange?: React.ChangeEventHandler<HTMLSelectElement>;
	required?: boolean;
	selectedValue?: string;
	values: PropertyItemEnumSelectValues[];
}

export const PropertyItemEnumSelect: React.StatelessComponent<
	PropertyItemEnumSelectProps
> = props => (
	<PropertyItem description={props.description} label={props.label}>
		<Select onChange={props.onChange} selectedValue={props.selectedValue}>
			{!props.required && <SelectOption key="required" value="" label="" />}
			{props.values.map(value => (
				<SelectOption key={value.id} value={value.id} label={value.name} />
			))}
		</Select>
	</PropertyItem>
);
