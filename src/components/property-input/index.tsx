import * as React from 'react';
import { Color } from '../colors';
import { fonts } from '../fonts';
import { getSpace, SpaceSize } from '../space';
import styled, { css } from 'styled-components';

const INPUT_PADDING_RIGHT = (props: PropertyInputProps) =>
	props.type && props.type === PropertyInputType.Number ? 0 : getSpace(SpaceSize.S);

export const PropertyInputStyles = css`
	display: block;
	box-sizing: border-box;
	width: 100%;
	height: 30px;
	border: 0.5px solid ${Color.Grey90};
	padding-top: ${getSpace(SpaceSize.XS)}px;
	padding-right: ${INPUT_PADDING_RIGHT}px;
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
	::-webkit-input-placeholder {
		color: ${Color.Grey60};
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

const StyledInput = styled.input`
	${PropertyInputStyles};
`;

export interface PropertyInputProps {
	list?: string;
	className?: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	placeholder?: string;
	type?: PropertyInputType;
	value?: string;
}

export enum PropertyInputType {
	Text = 'text',
	Number = 'number'
}

export const PropertyInput: React.SFC<PropertyInputProps> = props => (
	<StyledInput
		list={props.list}
		onChange={props.onChange}
		onBlur={props.onBlur}
		type={props.type}
		value={props.value || ''}
		placeholder={props.placeholder}
	/>
);
