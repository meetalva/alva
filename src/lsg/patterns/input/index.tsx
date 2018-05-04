import { colors } from '../colors';
import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';

export interface InputProps {
	className?: string;
	disabled?: boolean;
	focused?: boolean;
	handleBlur?: React.FocusEventHandler<HTMLInputElement>;
	handleChange?: React.ChangeEventHandler<HTMLInputElement>;
	handleKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
	placeholder?: string;
	type?: InputTypes;
	value?: string | number;
}

export enum InputTypes {
	string = 'text',
	number = 'number',
	search = 'search'
}

const StyledInput = styled.input`
	outline: none;
	border: 0.5px solid ${colors.grey90.toString()};
	border-radius: 1px;
	background: ${colors.white.toString()};

	padding: ${getSpace(Size.XS)}px;

	margin: 0 ${getSpace(Size.L)}px;
	font-size: 12px;

	box-sizing: border-box;
	display: block;
	width: calc(100% - ${getSpace(Size.M) * 2}px);
	color: ${colors.black.toString()};

	font-weight: 500;
	transition: background-color 0.2s;

	::placeholder {
		color: ${colors.grey50.toString()};
	}

	:hover {
		::placeholder {
			color: ${colors.black.toString()};
		}
	}
`;

const Input: React.StatelessComponent<InputProps> = props => (
	<StyledInput
		autoFocus={props.focused}
		className={props.className}
		disabled={props.disabled}
		type={props.type}
		value={props.value}
		onBlur={props.handleBlur}
		onChange={props.handleChange}
		onKeyDown={props.handleKeyDown}
		placeholder={props.placeholder}
	/>
);

export default Input;
