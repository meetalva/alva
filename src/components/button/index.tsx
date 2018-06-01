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
					background: ${Color.Black};
					color: ${Color.White};
				`;
			case ButtonOrder.Primary:
			default:
				return css`
					background: ${Color.Blue};
					color: ${Color.White};
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
				background: ${Color.White};
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
