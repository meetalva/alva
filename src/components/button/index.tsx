import { Color } from '../colors';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled, { css } from 'styled-components';

export interface ButtonProps {
	children?: React.ReactNode;
	/** @description For dark backgrounds */
	inverted?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
	/** @description Visual weight @default Primary */
	order?: ButtonOrder;
	/** @description Spatial weight @default */
	size?: ButtonSize;
	textColor?: Color;
}

export enum ButtonOrder {
	Primary,
	Secondary
}

export enum ButtonSize {
	Large,
	Medium,
	Small
}

const StyledButton = styled.button`
	border: none;
	border-radius: 3px;
	outline: none;

	${(props: ButtonProps) => {
		switch (props.order) {
			case ButtonOrder.Secondary:
				return css`
					background: transparent;
					border: 1px solid ${Color.Grey50};
					color: ${Color.Grey50};

					&:active {
						border-color: ${Color.Black};
						color: ${Color.Black};
					}
				`;
			case ButtonOrder.Primary:
			default:
				return css`
					background: ${Color.Blue20};
					border: 1px solid ${Color.Blue20};
					color: ${Color.White};

					&:active {
						background: ${Color.Blue};
						border-color: ${Color.Blue};
					}
				`;
		}
	}};

	${(props: ButtonProps) => {
		switch (props.size) {
			case ButtonSize.Small:
				return css`
					font-size: 12px;
					padding: ${getSpace(SpaceSize.XXS)}px ${getSpace(SpaceSize.M)}px;
				`;

			case ButtonSize.Medium:
				return css`
					font-size: 12px;
					padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.L)}px;
				`;

			case ButtonSize.Large:
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
				background: ${Color.White};
				border-color: ${Color.White};

				&:active {
					background: ${Color.White};
					border-color: ${Color.White};
					opacity: 0.8;
				}
			`
			: ''};
	${(props: ButtonProps) =>
		typeof props.textColor !== 'undefined'
			? `
				color: ${props.textColor};
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
