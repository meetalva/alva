import { colors } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export interface InputProps {
	className?: string;
	disabled?: boolean;
	type?: InputTypes;
	value?: string | number;
	handleChange?: React.ChangeEventHandler<HTMLInputElement>;
	placeholder?: string;
}

export enum InputTypes {
	string = 'text',
	number = 'number',
	search = 'search'
}

const StyledInput = styled.input`
	/* reset Styles */
	-webkit-appearance:textfield;
	outline: none;

	box-sizing: border-box;
	display: block;
	width: 100%;
	padding: 8px 11px;
  	border: 1px solid ${colors.grey90.toString()};
	color: ${colors.grey60.toString()};
	:focus {
		box-shadow: 0 0 10px ${colors.blue40.toRGBString(0.5)};
		padding: 8px 11px;
		border: 1px solid ${colors.blue40.toString()};
	}

	::placeholder {
		color: ${colors.grey90.toString()};
	}

	::-webkit-search-decoration {
			display:none;
		}
`;

const Input: React.StatelessComponent<InputProps> = props => (
	<StyledInput
		className={props.className}
		disabled={props.disabled}
		type={props.type}
		value={props.value}
		onChange={props.handleChange}
		placeholder={props.placeholder}
	/>
);

export default Input;
