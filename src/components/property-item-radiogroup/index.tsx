import { Color } from '../colors';
import { PropertyItem } from '../property-item';
import { Icon, IconName, IconSize } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PropertyItemRadiogroupValues {
	id: string;
	name: string;
	icon: IconName | undefined;
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
	icon: IconName | undefined;
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
	//align-items: center;
`;

const StyledItem = styled.label`
	box-sizing: border-box;
	text-align: center;
	flex-grow: 1;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	border-right: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-right-width: 0.5px;
	}
	background: ${(props: RadiogroupItemProps) => (props.active ? Color.Blue40 : 'transparent')};
	color: ${(props: RadiogroupItemProps) => (props.active ? Color.White : Color.Grey50)};

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

export const RadiogroupItem: React.StatelessComponent<RadiogroupItemProps> = props => (
	<StyledItem icon={props.icon} id={props.id} active={props.active} name={props.name} title={props.name}>
		{props.icon ? (
			<Icon name={props.icon} size={IconSize.S} />
		) : (
			props.name
		)}
		<StyledInput type="radio" id={props.id} name="lala" value={props.id} onChange={props.onChange} />
	</StyledItem>
);


export const PropertyItemRadiogroup: React.StatelessComponent<PropertyItemRadiogroupProps> = props => (
	<PropertyItem description={props.description} label={props.label}>
		<StyledRadioGroup>
			{props.values.map(value => (
				<RadiogroupItem name={value.name} icon={value.icon} id={value.id} onChange={props.onChange} active={value.id === props.selectedValue} />
			))}
		</StyledRadioGroup>
	</PropertyItem>
);
