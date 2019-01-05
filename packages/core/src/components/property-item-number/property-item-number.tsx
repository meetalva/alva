import * as React from 'react';
import { PropertyInput, PropertyInputType } from '../property-input';
import { PropertyItem } from '../property-item';

export interface PropertyItemNumberProps {
	className?: string;
	description?: string;
	label: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	placeholder?: string;
	value?: number;

	onDecrement?: React.MouseEventHandler;
	onIncrement?: React.MouseEventHandler;
}

export const PropertyItemNumber: React.StatelessComponent<PropertyItemNumberProps> = props => (
	<PropertyItem description={props.description} label={props.label}>
		<PropertyInput
			onChange={props.onChange}
			onBlur={props.onBlur}
			type={PropertyInputType.Number}
			onDecrement={props.onDecrement}
			onIncrement={props.onIncrement}
			value={
				typeof props.value === 'undefined' || Number.isNaN(props.value)
					? ''
					: String(props.value)
			}
			placeholder={props.placeholder}
		/>
	</PropertyItem>
);
