import { colors } from '../colors';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface InputProps {
	className?: string;
	disabled?: boolean;
	focused?: boolean;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler<HTMLInputElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
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
	/* reset Styles */
	-webkit-appearance: textfield;
	outline: none;
	border: none;
	background: transparent;

	margin: 0 ${getSpace(SpaceSize.L)}px;
	font-size: 15px;

	box-sizing: border-box;
	display: block;
	width: calc(100% - ${getSpace(SpaceSize.M) * 2}px);
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

export const Input: React.StatelessComponent<InputProps> = props => (
	<StyledInput
		autoFocus={props.focused}
		className={props.className}
		disabled={props.disabled}
		type={props.type}
		value={props.value}
		onBlur={props.onBlur}
		onFocus={props.onFocus}
		onChange={props.onChange}
		onClick={props.onClick}
		onKeyDown={props.onKeyDown}
		placeholder={props.placeholder}
	/>
);

export default Input;
