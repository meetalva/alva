import { Color } from '../colors';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';
import { Check } from 'react-feather';
import { Spinner } from '../spinner';
import { IconSize } from '../icons';

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
	state?: ButtonState;
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

export enum ButtonState {
	Default,
	Progress,
	Done
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
	position: relative;
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
	${props =>
		(props.state === ButtonState.Progress || props.state === ButtonState.Done) &&
		'color: transparent;'}
	transition: color 0.1s;

	${props =>
		props.state === ButtonState.Done &&
		`
		animation: showText .1s 1.7s ease both;
		@keyframes showText {
			from {
				color: transparent;
			}
			to {
				color: ${props.inverted ? primaryFill(props) : Color.White};
			}
		}
	`}

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

const StyledWrapper = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
	display: flex;
	align-items: center;
	justify-content: center;
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

const StyledDoneWrapper = styled(StyledWrapper)`
	animation: checkAnimation 1.5s 0.1s ease both;
	@keyframes checkAnimation {
		0% {
			transform: scale(0.5);
			opacity: 0;
		}
		10% {
			transform: scale(1);
			opacity: 1;
		}
		90% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(0.5);
			opacity: 0;
		}
	}
`;

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
			state={props.state}
		>
			{props.children}
			{props.state === ButtonState.Progress && (
				<StyledWrapper>
					<Spinner size={IconSize.XS} />
				</StyledWrapper>
			)}
			{props.state === ButtonState.Done && (
				<StyledDoneWrapper>
					<Check size={18} color={Color.White} strokeWidth={3} />
				</StyledDoneWrapper>
			)}
		</Component>
	);
};
