import { Color, colors } from '../colors';
import * as React from 'react';
import styled, { css } from 'styled-components';

export interface ButtonProps {
	color?: Color;
	onClick?: React.MouseEventHandler<HTMLElement>;
	order?: ButtonOrder;
}

export interface StyledButtonProps {
	color?: Color;
}

export enum ButtonOrder {
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
			case ButtonOrder.Secondary:
				return css`
					background: ${colors.black.toString()};
					color: ${colors.white.toString()};

					:hover {
						background: ${colors.grey20.toString()};
					}
				`;
			case ButtonOrder.Primary:
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

export const Button: React.StatelessComponent<ButtonProps> = props => (
	<StyledButton onClick={props.onClick}>{props.children}</StyledButton>
);

export default Button;
