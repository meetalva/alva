import { Color, colors } from '../colors';
import * as React from 'react';
import styled, { css } from 'styled-components';

export interface ButtonProps {
	color?: Color;
	handleClick?: React.MouseEventHandler<HTMLElement>;
	order?: Order;
}

export interface StyledButtonProps {
	color?: Color;
}

export enum Order {
	Primary,
	Secondary
}

const StyledButton = styled.button`
	padding: 15px 42px;
	border: none;
	border-radius: 4px;
	font-size: 15px;
	cursor: pointer;
	${(props: ButtonProps) => {
		switch (props.order) {
			case Order.Secondary:
				return css`
					background: ${colors.black.toString()};
					color: ${colors.white.toString()};

					:hover {
						background: ${colors.grey20.toString()};
					}
				`;
			case Order.Primary:
			default:
				return css`
					background: ${colors.blue.toString()};
					color: ${colors.white.toString()};

					:hover {
						background: ${colors.blue20.toString()};
					}
				`;
		}
	}};
`;

const Button: React.StatelessComponent<ButtonProps> = props => (
	<StyledButton onClick={props.handleClick}>{props.children}</StyledButton>
);

export default Button;
