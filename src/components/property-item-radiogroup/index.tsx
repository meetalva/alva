import { Color } from '../colors';
import { PropertyItem } from '../property-item';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PropertyItemRadiogroupValues {
	id: string;
	name: string;
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

export interface RadiogroupItemProps {
	active: boolean;
	name: string;
	id: string;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const StyledRadioGroup = styled.div`
	/* stylelint-disable-next-line */
	display: flex;
	box-sizing: border-box;
	width: 100%;
	height: 30px;
	//padding: ${getSpace(SpaceSize.S)}px;
	border: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}
	background: ${Color.White};
	border-radius: 3px;
`;

const StyledItem = styled.label`
	overflow: hidden;
	flex-grow: 1;
	font-size: 5px;
	background: ${(props: RadiogroupItemProps) => (props.active ? Color.Grey50 : 'transparent')};
`;

const StyledInput = styled.input`
	display: none;
`;

export const RadiogroupItem: React.StatelessComponent<RadiogroupItemProps> = props => (
	<StyledItem id={props.id} active={props.active} name={props.name}>
		{props.name}
		<StyledInput type="radio" id={props.id} name="lala" value={props.id} onChange={props.onChange} />
	</StyledItem>
);


export const PropertyItemRadiogroup: React.StatelessComponent<PropertyItemRadiogroupProps> = props => (
	<PropertyItem description={props.description} label={props.label}>
		<StyledRadioGroup>
			{props.values.map(value => (
				<RadiogroupItem name={value.name} id={value.id} onChange={props.onChange} active={value.id === props.selectedValue} />
			))}
		</StyledRadioGroup>
	</PropertyItem>
);
