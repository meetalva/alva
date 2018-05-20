import { Color, colors } from '../colors';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled, { css } from 'styled-components';

export interface ButtonProps {
	textColor?: Color;
	onClick?: React.MouseEventHandler<HTMLElement>;
	order?: ButtonOrder;
	size?: ButtonSize;
	inverted?: boolean;
}

export enum ButtonOrder {
	Primary,
	Secondary
}

export enum ButtonSize {
	Medium,
	Small
}

const StyledButton = styled.button`
	border: none;
	border-radius: 3px;

	&:hover {
		opacity: 0.9;
	}

	${(props: ButtonProps) => {
		switch (props.order) {
			case ButtonOrder.Secondary:
				return css`
					background: ${colors.black.toString()};
					color: ${colors.white.toString()};
				`;
			case ButtonOrder.Primary:
			default:
				return css`
					background: ${colors.blue.toString()};
					color: ${colors.white.toString()};
				`;
		}
	}};

	${(props: ButtonProps) => {
		switch (props.size) {
			case ButtonSize.Small:
				return css`
					font-size: 12px;
					padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.L)}px;
				`;

			case ButtonSize.Medium:
			default:
				return css`
					font-size: 15px;
					padding: ${getSpace(SpaceSize.M)}px ${getSpace(SpaceSize.XXXL)}px;
				`;
		}
	}};

	${(props: ButtonProps) =>
		props.inverted
			? `
				background: ${colors.white.toString()};
			`
			: ''};

	${(props: ButtonProps) =>
		typeof props.textColor !== 'undefined'
			? `
				color: ${props.textColor.toString()};
			`
			: ''};
`;

export const Button: React.StatelessComponent<ButtonProps> = props => (
	<StyledButton
		onClick={props.onClick}
		textColor={props.textColor}
		order={props.order}
		size={props.size}
		inverted={props.inverted}
	>
		{props.children}
	</StyledButton>
);

export default Button;
