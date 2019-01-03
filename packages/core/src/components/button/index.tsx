import { Color } from '../colors';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface ButtonProps {
	children?: React.ReactNode;
	disabled?: boolean;
	/** @description For dark backgrounds */
	inverted?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
	/** @description Visual weight @default Primary */
	order?: ButtonOrder;
	buttonRole?: ButtonRole;
	/** @description Spatial weight @default */
	size?: ButtonSize;
	textColor?: Color;
	as?: keyof JSX.IntrinsicElements;
	style?: React.CSSProperties;
}

export enum ButtonOrder {
	Primary,
	Secondary,
	Tertiary
}

export enum ButtonRole {
	Standalone,
	Inline
}

export enum ButtonSize {
	Large,
	Medium,
	Small
}

const BUTTON_FONT_SIZE = (props: ButtonProps): number => {
	switch (props.size) {
		case ButtonSize.Small:
		case ButtonSize.Medium:
			return 12;
		case ButtonSize.Large:
		default:
			return 15;
	}
};

const toPadding = (sizes: SpaceSize[]) => sizes.map(s => `${getSpace(s)}px`).join(' ');

const BUTTON_PADDING = (props: ButtonProps): string => {
	switch (props.size) {
		case ButtonSize.Small:
			return toPadding([SpaceSize.XXS, SpaceSize.M]);
		case ButtonSize.Medium:
			return toPadding([SpaceSize.XS, SpaceSize.L]);
		case ButtonSize.Large:
		default:
			return toPadding([SpaceSize.M, SpaceSize.XXXL]);
	}
};

const BUTTON_GROW = (props: ButtonProps): number => {
	switch (props.buttonRole) {
		case ButtonRole.Inline:
			return 1;
		case ButtonRole.Standalone:
		default:
			return 0;
	}
};

const StyledBaseButton = styled.button`
	box-sizing: border-box;
	border: none;
	outline: none;
`;

const DecoratedBaseButton = styled(StyledBaseButton)`
	border-radius: ${(props: ButtonProps) => (props.buttonRole === ButtonRole.Inline ? 0 : 3)}px;
	border-style: solid;
	border-width: ${(props: ButtonProps) => (props.buttonRole === ButtonRole.Inline ? 0 : 1)}px;

	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: ${(props: ButtonProps) => (props.buttonRole === ButtonRole.Inline ? 0 : 0.5)}px;
	}
`;

const SizedBaseButton = styled(DecoratedBaseButton)`
	font-size: ${BUTTON_FONT_SIZE}px;
	padding: ${BUTTON_PADDING};
	flex-grow: ${BUTTON_GROW};
`;

const StyledPrimaryButton = styled(SizedBaseButton)`
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
	text-align: center;
	background: ${props => (props.inverted ? Color.White : Color.Blue20)};
	border-color: ${props => (props.inverted ? Color.White : Color.Blue20)};
	color: ${props => (props.inverted ? Color.Blue20 : Color.White)};

	&:active {
		background: ${props => (props.inverted ? '' : Color.Blue)};
		border-color: ${props => (props.inverted ? '' : Color.Blue)};
		opacity: ${props => (props.inverted ? 0.8 : 1)};
	}
`;

const StyledSecondaryButton = styled(SizedBaseButton)`
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
	text-align: center;
	background: transparent;
	border-color: ${Color.Grey50};
	color: ${Color.Grey50};

	&:active {
		border-color: ${Color.Black};
		color: ${Color.Black};
	}
`;

const StyledTertiaryButton = styled(SizedBaseButton)`
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
	text-align: center;
	background: transparent;
	border-color: ${Color.Grey90};
	color: ${Color.Grey36};

	&:active {
		background: ${Color.Grey90};
		color: ${Color.Black};
	}
`;

export type AnyButton =
	| typeof StyledPrimaryButton
	| typeof StyledTertiaryButton
	| typeof StyledSecondaryButton;

const getComponent = (props: ButtonProps): AnyButton => {
	switch (props.order) {
		case ButtonOrder.Secondary:
			return StyledSecondaryButton;
		case ButtonOrder.Tertiary:
			return StyledTertiaryButton;
		case ButtonOrder.Primary:
		default:
			return StyledPrimaryButton;
	}
};

export const Button: React.StatelessComponent<ButtonProps> = props => {
	const Component = getComponent(props);

	return (
		<Component
			onClick={props.onClick}
			onDoubleClick={props.onDoubleClick}
			textColor={props.textColor}
			order={props.order}
			buttonRole={props.buttonRole}
			size={props.size}
			inverted={props.inverted}
			style={{ color: props.textColor, ...props.style }}
			disabled={props.disabled}
			as={props.as}
		>
			{props.children}
		</Component>
	);
};
