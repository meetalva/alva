import { Color } from '../colors';
import { PropertyItem } from '../property-item';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PropertyItemEnumRadiogroupValues {
	id: string;
	name: string;
}

export interface PropertyItemEnumProps {
	className?: string;
	description?: string;
	label: string;
	onChange?: React.ChangeEventHandler<HTMLSelectElement>;
	required?: boolean;
	selectedValue?: string;
	values: PropertyItemEnumRadiogroupValues[];
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
	background: lightblue;

	&:active {
		background: red;
	}
`;

const StyledInput = styled.input`
	//display: none;
`;

export const PropertyItemEnumRadiogroup: React.StatelessComponent<
	PropertyItemEnumProps
> = props => (
	<PropertyItem description={props.description} label={props.label}>
		<StyledRadioGroup>
			{props.values.map(value => (
				<StyledItem>
					{value.id}
					{value.name}
					<StyledInput type="radio" id={value.id} name={value.id} value={value.id} />
				</StyledItem>
			))}
		</StyledRadioGroup>
	</PropertyItem>
);
