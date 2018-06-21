import * as React from 'react';
import { Select, SelectOption } from '../select';
import { PropertyItem } from '../property-item';
import { PatternPropertyInputType } from '../../types';

export interface PropertyItemEnumValues {
	id: string;
	name: string;
}

export interface PropertyItemEnumProps {
	className?: string;
	description?: string;
	inputType: PatternPropertyInputType;
	label: string;
	onChange?: React.ChangeEventHandler<HTMLSelectElement>;
	required?: boolean;
	selectedValue?: string;
	values: PropertyItemEnumValues[];
}

export const PropertyItemEnum: React.StatelessComponent<PropertyItemEnumProps> = props => (
	<PropertyItem description={props.description} label={props.label}>
		<Select onChange={props.onChange} selectedValue={props.selectedValue}>
			{!props.required && <SelectOption key="required" value="" label="" />}
			{props.values.map(value => (
				<SelectOption key={value.id} value={value.id} label={value.name} />
			))}
		</Select>
		{props.inputType === PatternPropertyInputType.RadioGroup ? 'Hello' : 'no'}
	</PropertyItem>
);
