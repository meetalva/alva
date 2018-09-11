import { Color } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

import { SpaceSize } from '../space';

export enum LayoutDirection {
	Row = 'row',
	Column = 'column'
}

export enum LayoutSide {
	Right = 'Right',
	Left = 'Left'
}

export enum LayoutBorder {
	None = 'None',
	Side = 'Side'
}

export enum LayoutWrap {
	Wrap = 'Wrap',
	NoWrap = 'NoWrap'
}

export interface LayoutProps {
	border?: LayoutBorder;
	className?: string;
	direction?: LayoutDirection;
	inset?: SpaceSize;
	onClick?: React.MouseEventHandler<HTMLElement>;
	side?: LayoutSide;
	children?: React.ReactNode;
}

export interface MainAreaProps {
	border?: LayoutBorder;
	className?: string;
	direction?: LayoutDirection;
	onClick?: React.MouseEventHandler<HTMLElement>;
	children?: React.ReactNode;
}

export interface SideBarProps {
	border?: LayoutBorder;
	className?: string;
	direction?: LayoutDirection;
	onClick?: React.MouseEventHandler<HTMLElement>;
	side?: LayoutSide;
	children?: React.ReactNode;
}

export interface LayoutProps {
	border?: LayoutBorder;
	className?: string;
	direction?: LayoutDirection;
	inset?: SpaceSize;
	onClick?: React.MouseEventHandler<HTMLElement>;
	wrap?: LayoutWrap;
	children?: React.ReactNode;
}

const StyledLayout = styled.div`
	display: flex;
	width: 100%;
	box-sizing: border-box;
	flex-direction: ${(props: LayoutProps) =>
		props.direction === LayoutDirection.Column ? 'column' : 'row'};
	flex-wrap: ${(props: LayoutProps) => (props.wrap === LayoutWrap.Wrap ? 'wrap' : 'nowrap')};
	border-width: 0;
	border-style: solid;
	border-color: ${Color.BlackAlpha13};
	border-right-width: ${props =>
		props.side === LayoutSide.Left && props.border === LayoutBorder.Side ? 1 : 0}px;
	border-left-width: ${props =>
		props.side === LayoutSide.Right && props.border === LayoutBorder.Side ? 1 : 0}px;
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-right-width: ${props =>
			props.side === LayoutSide.Left && props.border === LayoutBorder.Side ? 0.5 : 0}px;
		border-left-width: ${props =>
			props.side === LayoutSide.Right && props.border === LayoutBorder.Side ? 0.5 : 0}px;
	}
	${(props: LayoutProps) => {
		if (!props.inset) {
			return '';
		}
		return `padding: ${props.inset}px`;
	}};
`;

const StyledMainArea = styled(StyledLayout)`
	box-sizing: border-box;
	height: 100vh;
	padding-top: 40px;
	-webkit-font-smoothing: antialiased;
`;

const StyledSideBar = styled(StyledLayout)`
	flex-basis: 240px;
	height: 100%;
	overflow-y: auto;
`;

export interface FixedAreaProps {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
	z?: number;
	children?: React.ReactNode;
}

const StyledFixedArea = styled.div`
	position: fixed;
	top: ${(props: FixedAreaProps) => (typeof props.top === 'undefined' ? 'auto' : props.top)};
	right: ${(props: FixedAreaProps) => (typeof props.right === 'undefined' ? 'auto' : props.right)};
	bottom: ${(props: FixedAreaProps) =>
		typeof props.bottom === 'undefined' ? 'auto' : props.bottom};
	left: ${(props: FixedAreaProps) => (typeof props.left === 'undefined' ? 'auto' : props.left)};
	z-index: ${props => (typeof props.z === 'undefined' ? '' : props.z)};
`;

const StyledRelativeArea = styled.div`
	position: relative;
`;

export const FixedArea: React.StatelessComponent<FixedAreaProps> = props => (
	<StyledFixedArea {...props} />
);

export const RelativeArea: React.StatelessComponent = props => <StyledRelativeArea {...props} />;

export const MainArea: React.StatelessComponent<MainAreaProps> = props => (
	<StyledMainArea className={props.className} direction={props.direction} border={props.border}>
		{props.children}
	</StyledMainArea>
);

export const SideBar: React.StatelessComponent<SideBarProps> = props => (
	<StyledSideBar
		className={props.className}
		direction={props.direction}
		border={props.border}
		onClick={props.onClick}
		side={props.side}
	>
		{props.children}
	</StyledSideBar>
);

export const Layout: React.StatelessComponent<LayoutProps> = props => (
	<StyledLayout
		className={props.className}
		direction={props.direction}
		inset={props.inset}
		border={props.border}
		onClick={props.onClick}
		wrap={props.wrap}
	>
		{props.children}
	</StyledLayout>
);
