import * as React from 'react';
import { Color } from '../colors';
import { fonts } from '../fonts';
import { getSpace, SpaceSize } from '../space';
import styled, { css } from 'styled-components';
import { ChevronUp, ChevronDown } from 'react-feather';
import { IconSize } from '../icons';

export const PropertyInputStyles = css`
	display: block;
	box-sizing: border-box;
	width: 100%;
	height: 30px;
	border: 0.5px solid ${Color.Grey90};
	padding-top: ${getSpace(SpaceSize.XS)}px;
	padding-right: ${getSpace(SpaceSize.S)}px;
	padding-bottom: ${getSpace(SpaceSize.XS)}px;
	padding-left: ${getSpace(SpaceSize.XS + SpaceSize.XXS)}px;
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}
	border-radius: 3px;
	background: ${Color.White};
	color: ${Color.Grey20};
	font-family: ${fonts().NORMAL_FONT};
	font-size: 15px;
	text-overflow: ellipsis;
	transition: border-color 0.1s, box-shadow 0.1s, color 0.1s;
	-moz-appearance: textfield;
	::-webkit-input-placeholder {
		color: ${Color.Grey60};
	}
	::-webkit-outer-spin-button,
	::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}
	&:hover {
		color: ${Color.Black};
		border-color: ${Color.Grey60};
	}
	&:focus {
		outline: none;
		border-color: ${Color.Blue40};
		color: ${Color.Black};
		box-shadow: 0 0 3px ${Color.BlueAlpha40};
	}
`;

const StyledWrapper = styled.div`
	position: relative;
	width: 100%;
`;

const StyledStepper = styled.div`
	position: absolute;
	width: ${getSpace(SpaceSize.L)}px;
	right: 0;
	top: 0;
	border-left: 1px solid ${Color.Grey90};
	margin: 1px;

	display: flex;
	flex-direction: column;

	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}
`;
const StyledClicker = styled.div`
	width: 100%;
	height: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	flex-grow: 1;

	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}

	&:first-of-type {
		border-bottom: 1px solid ${Color.Grey90};
	}

	svg {
		color: ${Color.Grey60};
		display: block;
	}

	&:hover {
		svg {
			color: ${Color.Grey20};
		}
	}
`;

const StyledInput = styled.input`
	${PropertyInputStyles};
	${(props: PropertyInputProps) =>
		props.type && props.type === PropertyInputType.Number && 'padding-right: 0;'};
`;

export interface PropertyInputProps {
	list?: string;
	className?: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler;
	placeholder?: string;
	type?: PropertyInputType;
	value?: string;
	onMinusClick?: React.MouseEventHandler;
	onPlusClick?: React.MouseEventHandler;
}

export enum PropertyInputType {
	Text = 'text',
	Number = 'number'
}

export const PropertyInput: React.SFC<PropertyInputProps> = props => (
	<StyledWrapper>
		<StyledInput
			list={props.list}
			onChange={props.onChange}
			onBlur={props.onBlur}
			onFocus={props.onFocus}
			onClick={props.onClick}
			type={props.type}
			value={props.value || ''}
			placeholder={props.placeholder}
		/>
		{props.type === 'number' && (
			<StyledStepper>
				<StyledClicker onClick={props.onPlusClick}>
					<ChevronUp size={IconSize.XXS} />
				</StyledClicker>
				<StyledClicker onClick={props.onMinusClick}>
					<ChevronDown size={IconSize.XXS} />
				</StyledClicker>
			</StyledStepper>
		)}
	</StyledWrapper>
);
