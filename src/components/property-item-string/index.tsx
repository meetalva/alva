import * as React from 'react';
import { PropertyInput, PropertyInputType } from '../property-input';
import { PropertyItem } from '../property-item';

export interface PropertyItemStringProps {
	className?: string;
	description?: string;
	label: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	placeholder?: string;
	value?: string;
}

export const PropertyItemString: React.StatelessComponent<PropertyItemStringProps> = props => (
	<PropertyItem description={props.description} label={props.label}>
		<PropertyInput
			onChange={props.onChange}
			onBlur={props.onBlur}
			type={PropertyInputType.Text}
			value={props.value || ''}
			placeholder={props.placeholder}
		/>
	</PropertyItem>
);
