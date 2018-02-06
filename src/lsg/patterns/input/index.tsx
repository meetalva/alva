import { colors } from '../colors';
import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';

export interface InputProps {
	className?: string;
	disabled?: boolean;
	type?: InputTypes;
	value?: string | number;
	handleChange?: React.ChangeEventHandler<HTMLInputElement>;
	handleKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
	placeholder?: string;
}

export enum InputTypes {
	string = 'text',
	number = 'number',
	search = 'search'
}

const StyledInput = styled.input`
	/* reset Styles */
	-webkit-appearance: textfield;
	outline: none;
	border: none;
	background: transparent;

	margin: 0 ${getSpace(Size.L)}px;
	font-size: 15px;

	box-sizing: border-box;
	display: block;
	width: calc(100% - ${getSpace(Size.M) * 2}px);
	color: ${colors.black.toString()};

	font-weight: 500;
	transition: color 0.2s;

	::placeholder {
		color: ${colors.grey50.toString()};
		transition: color 0.2s;
	}

	:hover {
		::placeholder {
			color: ${colors.black.toString()};
		}
	}

	::-webkit-search-decoration {
		display: none;
	}
`;

const Input: React.StatelessComponent<InputProps> = props => (
	<StyledInput
		className={props.className}
		disabled={props.disabled}
		type={props.type}
		value={props.value}
		onChange={props.handleChange}
		onKeyDown={props.handleKeyDown}
		placeholder={props.placeholder}
	/>
);

export default Input;
