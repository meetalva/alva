import * as React from 'react';
import styled from '@emotion/styled';
import { Color } from '../colors';
import { fonts } from '../fonts';

export interface ButtonProps {
	/** @name Disabled @default false */
	disabled?: boolean;

	/** @name Order */
	order?: ButtonOrder;

	/** @name Color */
	color?: Color;

	onClick?: React.MouseEventHandler<HTMLDivElement>;
	children?: React.ReactNode;
}

export enum ButtonOrder {
	Primary = 'button-primary',
	Secondary = 'button-secondary'
}

const StyledButton =
	styled.div <
	ButtonProps >
	`
	padding: 12px 20px;
	min-width: 100px;
	font-size: 18px;
	font-family: ${fonts().NORMAL_FONT};
	border-radius: 3px;
	box-sizing: border-box;
	display: inline-block;
	width: fit-content;
	cursor: ${props => (!props.disabled ? 'pointer' : 'default')};

	@media screen and (min-width: 960px) {
		padding: 15px 30px;
	}
`;

const ButtonPrimary =
	styled.div <
	ButtonProps >
	`
	background: ${props => props.color || Color.Pink};
	border: none;
	color: ${Color.White};
	background-color: ${props => (props.disabled ? Color.Grey70 : '')};
	&:hover {
		background-color: ${props => (props.disabled ? Color.Grey70 : Color.PinkLight)};
	}
`;

const ButtonSecondary =
	styled.div <
	ButtonProps >
	`
	border: 1px solid ${props => props.color || Color.Pink};
	color: ${props => props.color || Color.Pink};
	border-color: ${props => (props.disabled ? Color.Grey70 : '')};
	color: ${props => (props.disabled ? Color.Grey70 : '')};
	&:hover {
		border-color: ${props => (props.disabled ? Color.Grey70 : Color.PinkLight)};
		color: ${props => (props.disabled ? Color.Grey70 : Color.PinkLight)};
	}
`;

/**
 * @icon MinusSquare
 */
export const Button: React.StatelessComponent<ButtonProps> = (props): JSX.Element => {
	const button = props.order === ButtonOrder.Primary ? ButtonPrimary : ButtonSecondary;
	const Component = StyledButton.withComponent(button);
	return <Component {...props}>{props.children}</Component>;
};
