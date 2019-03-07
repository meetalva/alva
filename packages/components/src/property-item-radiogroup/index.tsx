import { Color } from '../colors';
import { PropertyItem } from '../property-item';
import * as React from 'react';
import styled from 'styled-components';
const Icon = require('react-feather');

export interface PropertyItemRadiogroupValues {
	id: string;
	name: string;
	icon: string;
}

export interface PropertyItemRadiogroupProps {
	className?: string;
	description?: string;
	label: string;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	required?: boolean;
	selectedValue?: string;
	values: PropertyItemRadiogroupValues[];
}

export interface RadioGroupItemProps {
	active: boolean;
	name: string;
	id: string;
	icon: string;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const StyledRadioGroup = styled.div`
	display: flex;
	box-sizing: border-box;
	width: 100%;
	height: 30px;
	border: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}
	background: ${Color.White};
	border-radius: 3px;
`;

const StyledItem = styled.label`
	box-sizing: border-box;
	text-align: center;
	flex-grow: 1;
	height: 100%;
	display: flex;
	align-items: center;
	user-select: none;
	justify-content: center;
	border-right: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-right-width: 0.5px;
	}
	background: ${(props: RadioGroupItemProps) => (props.active ? Color.Blue40 : 'transparent')};
	color: ${(props: RadioGroupItemProps) => (props.active ? Color.White : Color.Grey50)};

	&:first-of-type {
		border-radius: 3px 0 0 3px;
	}

	&:last-of-type {
		border-right: none;
		border-radius: 0 3px 3px 0;
	}
`;

const StyledInput = styled.input`
	display: none;
`;

export const RadioGroupItem: React.StatelessComponent<RadioGroupItemProps> = props => {
	const IconImage = Icon.hasOwnProperty(props.icon) ? Icon[props.icon] : Icon.Box;

	return (
		<StyledItem
			icon={props.icon}
			id={props.id}
			active={props.active}
			name={props.name}
			title={props.name}
		>
			{props.icon ? <IconImage size={18} strokeWidth={1.5} /> : props.name}
			<StyledInput
				type="radio"
				id={props.id}
				name="radiogroup"
				value={props.id}
				onChange={props.onChange}
			/>
		</StyledItem>
	);
};

export const PropertyItemRadiogroup: React.StatelessComponent<
	PropertyItemRadiogroupProps
> = props => (
	<PropertyItem description={props.description} label={props.label}>
		<StyledRadioGroup>
			{props.values.map(value => (
				<RadioGroupItem
					name={value.name}
					icon={value.icon}
					id={value.id}
					key={value.id}
					onChange={props.onChange}
					active={value.id === props.selectedValue}
				/>
			))}
		</StyledRadioGroup>
	</PropertyItem>
);
