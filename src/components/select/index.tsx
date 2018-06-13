import { Color } from '../colors';
import { fonts } from '../fonts';
import { Icon, IconName, IconSize } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

const StyledSelectWrapper = styled.div`
	width: 100%;
	flex-grow: 1;
	height: 30px;
	position: relative;
	display: inline-block;
	box-sizing: border-box;
	border-radius: 3px;
	background-color: ${Color.White};
`;

const StyledSelect = styled.select`
	/* stylelint-disable-next-line */
	appearance: none;
	box-sizing: border-box;
	width: 100%;
	height: 30px;
	padding: 0 ${getSpace(SpaceSize.XL)}px 0 ${getSpace(SpaceSize.XS + SpaceSize.XXS)}px;
	border: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}
	background: none;
	border-radius: 3px;
	color: ${Color.Grey20};
	font-family: ${fonts().NORMAL_FONT};
	font-size: 15px;
	text-overflow: ellipsis;
	transition: border-color 0.1s, box-shadow 0.1s, color 0.1s;
	&:hover {
		color: ${Color.Black};
		border-color: ${Color.Grey60};
	}
	&:focus {
		outline: none;
		color: ${Color.Black};
		border-color: ${Color.Blue40};
		box-shadow: 0 0 3px ${Color.BlueAlpha40};
	}
`;

const StyledIcon = styled(Icon)`
	position: absolute;
	right: 0;
	fill: ${Color.Grey60};
	width: 12px;
	height: 12px;
	padding: ${getSpace(SpaceSize.XS) + getSpace(SpaceSize.XXS)}px;
	transform: rotate(90deg);
	pointer-events: none;
`;

export interface SelectProps {
	/** @ignore */
	className?: string;
	onChange?: React.ChangeEventHandler<HTMLSelectElement>;
	selectedValue?: string;
}

export const Select: React.StatelessComponent<SelectProps> = props => (
	<StyledSelectWrapper>
		<StyledSelect
			className={props.className}
			onChange={props.onChange}
			value={props.selectedValue ? props.selectedValue : ''}
		>
			{props.children}
		</StyledSelect>
		<StyledIcon name={IconName.ArrowFillRight} size={IconSize.XXS} color={Color.Grey60} />
	</StyledSelectWrapper>
);

export interface SelectOptionProps {
	value: string;
	label?: string;
}

export const SelectOption: React.StatelessComponent<SelectOptionProps> = props => (
	<option value={props.value}>{props.label}</option>
);
