import { Color } from '../colors';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface ButtonProps {
	children?: React.ReactNode;
	disabled?: boolean;
	disabledAppearance?: boolean;
	/** @description For dark backgrounds */
	inverted?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
	/** @description Visual weight @default Primary */
	order?: ButtonOrder;
	buttonRole?: ButtonRole;
	/** @description Spatial weight @default */
	size?: ButtonSize;
	color?: string;
	as?: keyof JSX.IntrinsicElements;
	style?: React.CSSProperties;
	className?: string;
	type?: 'submit' | 'button';
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
			return toPadding([SpaceSize.XXS, SpaceSize.XS]);
		case ButtonSize.Medium:
			return toPadding([SpaceSize.XS, SpaceSize.M]);
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
	user-select: none;
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

const primaryFill = (props: ButtonProps) =>
	props.disabled || props.disabledAppearance ? Color.Grey60 : Color.Blue20;
const primaryFillActive = (props: ButtonProps) =>
	props.disabled || props.disabledAppearance ? Color.Grey60 : Color.Blue;

const StyledPrimaryButton =
	styled(SizedBaseButton) <
	ButtonProps >
	`
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
	text-align: center;
	background: ${props => (props.inverted ? Color.White : primaryFill(props))};
	border-color: transparent;
	color: ${props => (props.inverted ? primaryFill(props) : Color.White)};

	&:active {
		background: ${props => (props.inverted ? '' : primaryFillActive(props))};
		border-color: ${props => (props.inverted ? '' : primaryFillActive(props))};
		opacity: ${props => (props.inverted ? 0.8 : 1)};
	}
`;

const secondaryFill = (props: ButtonProps) => (props.color ? props.color : Color.Grey50);
const secondaryFillActive = (props: ButtonProps) =>
	props.disabled || props.disabledAppearance ? secondaryFill(props) : Color.Black;

const StyledSecondaryButton =
	styled(SizedBaseButton) <
	ButtonProps >
	`
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
	text-align: center;
	background: transparent;
	border-color: ${secondaryFill};
	color: ${secondaryFill};

	&:active {
		border-color: ${secondaryFillActive};
		color: ${secondaryFillActive};
	}
`;

const StyledTertiaryButton =
	styled(SizedBaseButton) <
	ButtonProps >
	`
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
	const Component = getComponent(props) as any;

	return (
		<Component
			as={props.as}
			buttonRole={props.buttonRole}
			className={props.className}
			disabled={props.disabled}
			disabledAppearance={props.disabledAppearance}
			inverted={props.inverted}
			onClick={props.onClick}
			onDoubleClick={props.onDoubleClick}
			order={props.order}
			size={props.size}
			style={{ color: props.color, ...props.style }}
			color={props.color}
		>
			{props.children}
		</Component>
	);
};
